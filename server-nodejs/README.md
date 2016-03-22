A Javascript DAMAS RESTful server implementation based on NodeJS and MongoDB. Some of its features are:

* JSON Web Token authentication (http://jwt.io)
* MongoDB database (https://www.mongodb.com/)
* A [fully documented API](https://github.com/remyla/damas-core/wiki/API) based on HTTP
* Javascript and Python clients modules (see /js/damas.js /py/damas.py in this repository)

## Install and configure

On a system with NodeJS and npm installed, in the server folder, run:
> npm install

Copy the default configuration file `conf_install.json` to `conf.json` and edit it according to your needs (see intructions below):

```js
{
        "auth" : "jwt",
        "connection" : {
                "Cert": "cert.pem",
                "Key": "key.pem"
        },
        "mongoDB" : {
                "host" : "localhost",
                "collection" : "node",
                "port" : 27017,
                "options" : { "auto_reconnect" : true }
        },
        "jwt" : {
                "passwordHashAlgorithm" : "sha1",
                "secret" : "webtokensecret",
                "exp" : 1440
        },
        "statics" : [
                "static",
                "/home/damas/bin/"
        ],
        "fileSystem": "/PRODUCTIONS/"
}
```
Copy it to conf.json in the same directory and edit it according to your needs:
* `auth`: `jwt` to use JSON Web Token authentication (see jwt options below) or `none` for no authentication (public access)
* `connection`: paths to the SSL certificate to use for https (see below to generate a self signed certificate)
* `jwt`: JSON Web Token authentication options
    * `passwordHashAlgorithm`: `sha1` or `md5`
    * `secret`:  encryption salt string
    * `exp`: token expiration time in seconds
* `mongoDB`: options to connect to the database. the default values to use a mongodb located on the same machine
* `statics`: a list of relative or absolute pathes to be served by the server. It contains server ressources and possible interfaces
* `fileSystem`: the path to the indexed files root directory to serve assets from

> In case you need to quickly create a self signed SSL certificate in order to use https you may find this line usefull
```
openssl req -new -x509 -days 9999 -nodes -out cert.pem -keyout key.pem
```

# Run
Run node in the server folder:
```
DEBUG=app:* node .
```
The server will be listening and waiting for commands on ports 8090 and 8443 by default. You can specify different ports and debug options. This could be useful to run a server for tests:
```
DEBUG=* HTTP_PORT=8091 HTTPS_PORT=8444 nodejs .
```
