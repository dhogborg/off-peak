#/bin/bash

source sentry.env

sentry-cli releases new "$VERSION"
sentry-cli releases set-commits "$VERSION" --auto
sentry-cli releases finalize "$VERSION"

sentry-cli releases files "$VERSION" upload-sourcemaps ./build/assets