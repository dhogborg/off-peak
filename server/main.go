package main

import (
	"encoding/json"
	"errors"
	"flag"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"time"

	"golang.org/x/oauth2"

	firebase "firebase.google.com/go"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"golang.org/x/net/context"
	"google.golang.org/api/option"
)

// OS Env keys
const (
	envOAuthClientID     = "OAUTH_CLIENT_ID"
	envOAuthClientSecret = "OAUTH_CLIENT_SECRET"
	envOAuthCallback     = "OAUTH_CALLBACK"
	envGinMode           = "GIN_MODE"
	envFirebaseProject   = "FIREBASE_PROJECT"
	envFirebaseKey       = "FIREBASE_KEY"
)

var staticFlag = flag.String("static", "", "Location of static files to serve")

var firebaseApp *firebase.App

func main() {
	logrus.Info("--- Starting server ---")
	if os.Getenv(envOAuthClientID) == "" ||
		os.Getenv(envOAuthClientSecret) == "" ||
		os.Getenv(envOAuthCallback) == "" {
		logrus.Error("missing OAuth credentials")
		os.Exit(0)
	}

	// Create a Firebase app configuration for stored snapshots
	var err error

	// Use the application default credentials
	conf := &firebase.Config{ProjectID: os.Getenv(envFirebaseProject)}
	sa := option.WithCredentialsFile(os.Getenv(envFirebaseKey))
	firebaseApp, err = firebase.NewApp(context.Background(), conf, sa)
	if err != nil {
		logrus.WithError(err).Error("error initializing firebase")
		os.Exit(0)
	}

	router := gin.Default()

	if os.Getenv(envGinMode) == "release" {
		router.Use(HSTSMiddleware())
	}

	router.GET("/env", env)
	router.GET("/api/v1/authorize", HandledHTTPResponse(authorize))
	router.GET("/api/v1/svkprofile", HandledHTTPResponse(svkProfile))
	router.GET("/api/v1/snapshots/", HandledHTTPResponse(getSnapshots))
	router.GET("/api/v1/snapshots/:id", HandledHTTPResponse(getSnapshot))
	router.POST("/api/v1/snapshots/", HandledHTTPResponse(postSnapshot))

	// Liveliness probe
	router.GET("/healthz", func(c *gin.Context) {
		c.String(200, "OK")
	})

	flag.Parse()
	if *staticFlag != "" {
		logrus.Info("Static serving form: " + *staticFlag)
		router.Use(static.Serve("/", static.LocalFile(*staticFlag, false)))
		// Serve the index file when the browser requests a URl with HTML5 history
		router.NoRoute(func(c *gin.Context) {
			c.File(*staticFlag + "/index.html")
		})
	}

	router.Run() // listen and serve on 0.0.0.0:8080
}

func env(c *gin.Context) {
	vars := map[string]string{
		"OAUTH_CLIENT_ID": os.Getenv(envOAuthClientID),
		"OAUTH_CALLBACK":  os.Getenv(envOAuthCallback),
	}
	pairs := []string{}
	for k, v := range vars {
		pairs = append(pairs, k+":"+`"`+v+`"`)
	}
	js := strings.Join(pairs, ", ")
	c.String(200, "window.env = {%s}", js)
}

type authResponse struct {
	Token   string    `json:"token"`
	Expires time.Time `json:"expires"`
}

var oAuthClient = oauth2.Config{
	ClientID:     os.Getenv(envOAuthClientID),
	ClientSecret: os.Getenv(envOAuthClientSecret),
	Endpoint: oauth2.Endpoint{
		AuthURL:  "https://thewall.tibber.com/connect/authorize",
		TokenURL: "https://thewall.tibber.com/connect/token",
	},
	RedirectURL: os.Getenv(envOAuthCallback),
	Scopes:      []string{"tibber_graph", "price", "consumption"},
}

func authorize(c *gin.Context) (int, interface{}, error) {
	if c.Query("code") == "" {
		return http.StatusBadRequest, nil, errors.New("query error")
	}

	oauthToken, err := oAuthClient.Exchange(oauth2.NoContext, c.Query("code"))
	if err != nil {
		logrus.Warn("auth error: ", err.Error())
		return http.StatusUnauthorized, nil, errors.New("unauthorized")
	}

	if !oauthToken.Valid() {
		return http.StatusUnauthorized, nil, errors.New("unauthorized")
	}

	return http.StatusOK, authResponse{
		Token:   oauthToken.AccessToken,
		Expires: oauthToken.Expiry,
	}, nil
}

func svkProfile(c *gin.Context) (int, interface{}, error) {
	if c.Query("periodFrom") == "" ||
		c.Query("periodTo") == "" ||
		c.Query("networkAreaIdString") == "" {
		return http.StatusBadRequest, nil, errors.New("query error")
	}

	url := `https://mimer.svk.se/ConsumptionProfile/DownloadText?groupByType=0` +
		`&periodFrom=` + c.Query("periodFrom") +
		`&periodTo=` + c.Query("periodTo") +
		`&networkAreaIdString=` + c.Query("networkAreaIdString")

	resp, err := http.Get(url)
	if err != nil {
		return http.StatusInternalServerError, nil, errors.New("response error: " + err.Error())
	}
	bytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return http.StatusInternalServerError, nil, errors.New("body error: " + err.Error())
	}

	c.String(200, string(bytes))
	return 0, nil, nil
}

func getSnapshot(c *gin.Context) (int, interface{}, error) {
	if c.Param("id") == "" {
		return http.StatusBadRequest, nil, errors.New("query error")
	}

	ctx := context.Background()
	client, err := firebaseApp.Firestore(ctx)
	if err != nil {
		logrus.WithError(err).Warn("error initializing firebase client")
		return http.StatusInternalServerError, nil, errors.New("database client error")
	}

	defer client.Close()

	ref := client.Collection("snaps").Doc(c.Param("id"))

	doc, err := ref.Get(ctx)
	if err != nil && strings.Contains(err.Error(), "not found") {
		return http.StatusNotFound, nil, errors.New("not found")
	}
	if err != nil {
		logrus.WithError(err).Warn("firebase error")
		return http.StatusInternalServerError, nil, errors.New("db request error")
	}

	var snap *Snapshot
	err = doc.DataTo(&snap)
	if err != nil || snap == nil {
		logrus.WithError(err).Warn("snapshot type error")
		return http.StatusInternalServerError, nil, errors.New("data format error")
	}

	// Don't leak data about a home on the snapshot, this is used by
	// visitors to a shared snapshot.
	snap.Home = snap.Home.Anonymized()

	return http.StatusOK, snap, nil
}

func getSnapshots(c *gin.Context) (int, interface{}, error) {
	return 0, nil, nil
}

func postSnapshot(c *gin.Context) (int, interface{}, error) {
	ctx := context.Background()
	client, err := firebaseApp.Firestore(ctx)
	if err != nil {
		logrus.WithError(err).Warn("error initializing firebase client")
		return http.StatusInternalServerError, nil, errors.New("database client error")

	}

	defer client.Close()

	body, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		logrus.WithError(err).Warn("data reading error")
		return http.StatusBadRequest, nil, errors.New("data error")

	}

	var data *Snapshot
	err = json.Unmarshal(body, &data)
	if err != nil || data == nil || !data.IsValid() {
		logrus.WithError(err).Warn("data marshalling error")
		return http.StatusBadRequest, nil, errors.New("data error")

	}

	data.CreatedAt = time.Now()
	doc, _, err := client.Collection("snaps").Add(ctx, data)
	if err != nil {
		logrus.WithError(err).Warn("data marshalling error")
		return http.StatusInternalServerError, nil, errors.New("database client error")
	}

	return http.StatusOK, map[string]string{
		"id": doc.ID,
	}, nil
}
