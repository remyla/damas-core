DAMAS RESTful server based on NodeJS with MongoDB database backend.

# Setup

## System prerequisites
NodeJs, npm, MongoDB

## Install

On a system with NodeJS and npm installed, in damas-core/server-nodejs/ folder run:
> npm install

## Configure
To run the service as HTTPS you may need to create a self signed SSL certificate:
> openssl req -new -x509 -days 9999 -nodes -out cert.pem -keyout key.pem

Copy the default configuration file
> damas-core/server-nodejs > cp conf_install.json conf.json

and edit it according to your needs

# Run
On Windows, the environment variable is set using the `set` command.
> set DEBUG=*
Then, run the program to be debugged as usual.

> DEBUG=app:* node .

The server will be listening and waiting for commands on ports 8090 and 8443 by default.

## Run a development server
A secondary server which will be used for tests may be useful. You can adapt the command line to specify alternate ports, and to show full debug information:
> DEBUG=* HTTP_PORT=8091 HTTPS_PORT=8444 nodejs .