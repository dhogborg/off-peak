package main

import (
	"encoding/json"
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
	router.GET("/api/v1/authorize", authorize)
	router.GET("/api/v1/svkprofile", svkProfile)
	router.GET("/api/v1/snapshots/:id", getSnapshot)
	router.POST("/api/v1/snapshots/", postSnapshot)

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

func authorize(c *gin.Context) {
	if c.Query("code") == "" {
		c.JSON(http.StatusBadRequest, errResponse{"query error"})
		return
	}

	oauthToken, err := oAuthClient.Exchange(oauth2.NoContext, c.Query("code"))
	if err != nil {
		logrus.Warn("auth error: ", err.Error())
		c.JSON(http.StatusUnauthorized, errResponse{"unauthorized"})
		return
	}

	if !oauthToken.Valid() {
		c.JSON(http.StatusUnauthorized, errResponse{"unauthorized"})
		return
	}

	c.JSON(200, authResponse{
		Token:   oauthToken.AccessToken,
		Expires: oauthToken.Expiry,
	})
}

func svkProfile(c *gin.Context) {
	if c.Query("periodFrom") == "" ||
		c.Query("periodTo") == "" ||
		c.Query("networkAreaId") == "" {
		c.JSON(http.StatusBadRequest, errResponse{"query error"})
		return
	}

	url := `https://mimer.svk.se/ReducedConsumptionProfile/DownloadText?groupByType=0` +
		`&periodFrom=` + c.Query("periodFrom") +
		`&periodTo=` + c.Query("periodTo") +
		`&networkAreaId=` + c.Query("networkAreaId")

	resp, err := http.Get(url)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errResponse{"response error: " + err.Error()})
	}
	bytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errResponse{"body error: " + err.Error()})
	}
	c.String(200, string(bytes))
}

func getSnapshot(c *gin.Context) {
	if c.Param("id") == "" {
		c.JSON(http.StatusBadRequest, errResponse{"query error"})
		return
	}

	ctx := context.Background()
	client, err := firebaseApp.Firestore(ctx)
	if err != nil {
		logrus.WithError(err).Warn("error initializing firebase client")
		c.JSON(http.StatusInternalServerError, errResponse{"database client error"})
		return
	}

	defer client.Close()

	ref := client.Collection("snaps").Doc(c.Param("id"))
	
	doc, err := ref.Get(ctx)
	if err != nil && strings.Contains(err.Error(), "not found") {
		c.JSON(http.StatusNotFound, errResponse{"not found"})
		return
	}
	if err != nil {
		logrus.WithError(err).Warn("firebase error")
		c.JSON(http.StatusInternalServerError, errResponse{"db request error"})
		return
	}

	c.JSON(http.StatusOK, doc.Data())
}

func postSnapshot(c *gin.Context) {
	ctx := context.Background()
	client, err := firebaseApp.Firestore(ctx)
	if err != nil {
		logrus.WithError(err).Warn("error initializing firebase client")
		c.JSON(http.StatusInternalServerError, errResponse{"database client error"})
		return
	}

	defer client.Close()

	body, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		logrus.WithError(err).Warn("data reading error")
		c.JSON(http.StatusBadRequest, errResponse{"data error"})
		return
	}

	var data *Snapshot
	err = json.Unmarshal(body, &data)
	if err != nil || data == nil || !data.IsValid() {
		logrus.WithError(err).Warn("data marshalling error")
		c.JSON(http.StatusBadRequest, errResponse{"data error"})
		return
	}

	data.CreatedAt = time.Now()
	doc, _, err := client.Collection("snaps").Add(ctx, data)
	if err != nil {
		logrus.WithError(err).Warn("data marshalling error")
		c.JSON(http.StatusInternalServerError, errResponse{"database client error"})
		return
	}

	c.JSON(http.StatusOK, map[string]string{
		"id": doc.ID,
	})
}

// HSTSMiddleware adds a HSTS header on every request
func HSTSMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Redirect plain HTTP requets to HTTPS. Behind the loadbalancer
		// we look at the X-header insted of request proto.
		proto := c.Request.Header.Get("X-Forwarded-Proto")
		if strings.ToLower(proto) == "http" {
			target := "https://" + c.Request.Host + c.Request.URL.Path
			c.Redirect(http.StatusTemporaryRedirect, target)
			c.Abort()
			return
		}

		// HSTS requsets are ignored by browser when served over HTTP
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
	})
}
