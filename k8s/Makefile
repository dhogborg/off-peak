# Our oauth credentials 
include secrets.env

.PHONY: deps
deps:
	helm install stable/nginx-ingress --name router
	helm install stable/cert-manager --name cert-manager

.PHONY: secrets
secrets:
	@echo "Creating secrets"
	-kubectl create secret generic aws \
		--from-literal=OAUTH_CLIENT_ID=$(OAUTH_CLIENT_ID) \
		--from-literal=OAUTH_CLIENT_SECRET=$(OAUTH_CLIENT_SECRET)

	-kubectl create secret generic firebase-credentials \
		--from-file=key.json=secrets/key.json

.PHONY: install
install:
	helm install --name off-peak ./

.PHONY: test
test:
ifeq ($(TO),)
	$(error "Specify TO=<git tag>")
endif
	helm upgrade off-peak ./ --set offpeak.version=$(TO) --debug --dry-run

.PHONY: upgrade
upgrade:
ifeq ($(TO),)
	$(error "Specify TO=<git tag>")
endif
	helm upgrade off-peak ./ --set-string offpeak.version=$(TO)