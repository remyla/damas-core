Installation
============

This page explains how to install a new server. If you need to connect to an existing server, you can directly read the [Connect Guide](2-Connect).

# Run using Docker

Copy the files [/docker/compose.yaml](/docker/compose.yaml), [/docker/damas.json](/docker/damas.json) and [/docker/nginx.conf](/docker/nginx.conf) from this repository and run:

```
docker compose up
```
Then in a web browser, open `http://localhost`

Add the `-d` (detach) option to the command above to keep the servers running after closing the console. To stop the server and remove the containers, run:
```shell
docker compose down
docker compose rm
```


The runtime docker server directory structure looks like this:
```
 ├── db/          mongo data storing json
 ├── extensions/  additional server extensions
 ├── www/         additional served files
 ├── compose.yaml docker configuration file
 ├── damas.json   damas configuration file
 └── nginx.conf   nginx configuration file
```
The `db/`, `extensions/` and `www/` directories will be created at first launch is they don't exist. The directory `/etc/letsencrypt` of the host is mounted so the nginx container can see the certificates available on your host machine.


# Run from sources
Run the server from the sources (without docker):
```
cd server-nodejs
# install the dependencies
npm install
# run server
node .
```
Then in a web browser, open `http://localhost:8090`

You can specify some environment variables:
```sh
# enable debug
DEBUG=*
# change the http port to listen to
HTTP_PORT=8091
# run server
node .
```
On Windows, to run and debug, run:
```sh
set DEBUG=* & node .
```

# Configure {#configure}
The server reads its configuration from `docker/damas.json` or `server-nodejs/conf.json` depending on the chosen installation described above. You can edit it according to your needs:

```json
{
    "authorMode" : true,
    "db": "mongodb6",
    "mongodb6": {
        "host": "localhost",
        "collection": "node",
        "port": 27017,
        "options": { },
        "create_returns_obj": false
    },
    "extensions": {
    }
}
```
The configuration is divided into sections:
* `authorMode`: if enabled the users are able to edit the nodes created by them
* `db`: which Database Management System to use. Available values: `debug`, `mongodb6`, `mongodb` (legacy)
* `mongodb6`: MongoDB options. Keep the default values to use a database located on the same machine
* `extensions`: modules list to extend the core. See the [available extensions](../server-nodejs/extensions/).

Read about the [JWT extension](../server-nodejs/extensions/#jwt) to configure a user authentication system according to your needs.

#  Next steps
Now that you have a running server you can read the [Connect Guide](2-Connect.md) to setup a client environment with Python, JavaScript or Shell, and read the [API Reference](3-API-Reference.md).

In case you encounter some difficulties during the installation process you could create an issue describing the problem in this repository and we will try to solve it.
