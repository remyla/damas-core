doc:
	jsdoc -d ./doc js/damas.js server-nodejs/routes.js server-nodejs/model.js

clean:
	rm -rf doc
