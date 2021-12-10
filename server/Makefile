
include client.env

.PHONY: build
build:
	go build -o bin/offpeak *.go

.PHONY: run
run: build
	go run *.go

.PHONY: release
release: clean
	GOARCH=amd64 GOOS=linux go build -o bin/offpeak *.go

.PHONY: clean
clean:
	rm -rf bin

