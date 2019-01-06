VERSION = $(shell git describe --always)

.PHONY: run
run: 
	yarn start

.PHONY: build
build: clean
	yarn build
	make -C server release
	docker build -t eu.gcr.io/off-peak-224318/off-peak:latest .

.PHONY: release
release: build
	docker tag eu.gcr.io/off-peak-224318/off-peak:latest eu.gcr.io/off-peak-224318/off-peak:$(VERSION)
	docker push eu.gcr.io/off-peak-224318/off-peak:$(VERSION)

.PHONY: clean
clean:
	rm -rf build

.PHONY: deploy
deploy: build
	make -C k8s upgrade TO=$(VERSION)