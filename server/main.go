package main

import (
	"flag"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"time"

	"golang.org/x/oauth2"

	"github.com/Sirupsen/logrus"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

var staticFlag = flag.String("static", "", "Location of static files to serve")

func main() {
	logrus.Info("--- Starting server ---")
	if os.Getenv(envOAuthClientID) == "" ||
		os.Getenv(envOAuthClientSecret) == "" ||
		os.Getenv(envOAuthCallback) == "" {
		logrus.Error("missing OAuth credentials")
		os.Exit(0)
	}

	router := gin.Default()

	if os.Getenv(envGinMode) == "release" {
		router.Use(HSTSMiddleware())
	}

	router.GET("/env", env)
	router.GET("/api/v1/authorize", authorize)
	router.GET("/api/v1/svkprofile", svkProfile)

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

// HSTSMiddleware adds a HSTS header on every request
func HSTSMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		c.Header("Strict-Transport-Security", "max-age=3600; includeSubDomains")
	})
}

type errResponse struct {
	Error string `json:"error"`
}

// OS Env keys
const (
	envOAuthClientID     = "OAUTH_CLIENT_ID"
	envOAuthClientSecret = "OAUTH_CLIENT_SECRET"
	envOAuthCallback     = "OAUTH_CALLBACK"
	envGinMode           = "GIN_MODE"
)
