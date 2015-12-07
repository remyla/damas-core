DAMAS RESTful server based on NodeJS with MongoDB database backend.

# Setup

## System prerequisites
NodeJS, NPM, MongoDB

## Install

On a system with NodeJS and npm installed, in damas-core/server-nodejs/ folder run:
> npm install

To run the service as HTTPS you may need to create a self signed SSL certificate:
> openssl req -new -x509 -days 9999 -nodes -out cert.pem -keyout key.pem

Then copy the generated files `cert.pem` and `key.pem` to the server-nodejs/ directory.

## Configure

Copy the default configuration file
> damas-core/server-nodejs > cp conf_install.json conf.json

and edit it according to your needs.

* auth: `jwt` or `none` for JSON Web Token authentication or to use the service without authentication
* connection: specify paths to cert.pem and key.pem for SSL. In the server directory by default
* jwt: specify options for the authentication (secret, default token expiration time and passwords encryption algorithm)
* fileSystem: specify the path to the indexed files root directory
* mongoDB: specify options for the database connection
* publiclyServerFolders: you can specify a list of paths where the files will be served by the server. It can be relative of absolute pathes. By default, the `server-nodejs/public/` folder is served.

# Run
> DEBUG=app:* node .

On windows

> set DEBUG=*
> node .

The server will be listening and waiting for commands on ports 8090 and 8443 by default.

## Run a development server
A secondary server which will be used for tests may be useful. You can adapt the command line to specify alternate ports, and to show full debug information:
> DEBUG=* HTTP_PORT=8091 HTTPS_PORT=8444 nodejs .
