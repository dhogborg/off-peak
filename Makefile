VERSION=g$(shell git describe --always)
PROJECT?=off-peak-224318

default: build

.PHONY: setup
setup:
	yarn install

.PHONY: run
run: 
	yarn run start

.PHONY: build
build: clean
	yarn run build
	make -C server release
	docker build --platform linux/amd64 -t eu.gcr.io/$(PROJECT)/off-peak:latest .

.PHONY: release
release: build
	docker tag eu.gcr.io/$(PROJECT)/off-peak:latest eu.gcr.io/$(PROJECT)/off-peak:$(VERSION)
	docker push eu.gcr.io/$(PROJECT)/off-peak:$(VERSION)

.PHONY: clean
clean:
	rm -rf build

.PHONY: deploy
deploy: release
	make -C k8s upgrade TO=$(VERSION)