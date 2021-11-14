VERSION := $(shell cat VERSION)

all: image doc


doc:
	jsdoc -d=./doc js/damas.js server-nodejs/routes/cruds.js server-nodejs/db/mongodb.js

image: docker/Dockerfile
	docker build --no-cache=true -t primcode/damas-core:"$(VERSION)" docker

push:
	docker push primcode/damas-core:"$(VERSION)"

clean:
	rm -rf doc
