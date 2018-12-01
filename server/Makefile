
include ../client.env

.PHONY: build
build:
	go build -o bin/offpeak *.go

.PHONY: run
run: build
	./bin/offpeak

.PHONY: release
release: clean
	GOOS=linux go build -o bin/offpeak *.go

.PHONY: clean
clean:
	rm -rf bin

