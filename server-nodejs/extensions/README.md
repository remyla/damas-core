Extensions
==========

The extensions give new behaviors to the damas-core nodejs-server like extending the API, managing user authentication, or permissions. This page gives a list of the extensions which are provided in this repository. The extensions are loaded at startup and are listed in the configuration file `conf.json`. They are loaded by order of appearance in that file. The extensions are defined using a simple format:
```json
{
    "extensions": {
        "extension_name": {
            "enable": true,
            "path": "extension_dir/extend.js",
            "conf": {}
        }
    }
}
```
Dummy extension example:
```js
"aforge": {
    "enable": true,
    "path": "./aforge/aforge.js",
    "conf": {
        "apiKey": "________"
    }
}
```
`enable` and `conf` keys are optional. Omitting them means that the extension is enabled and that it does not need configuration. `path` and `conf` can be relative paths or absolute paths, and `conf` could be either an object containing configuration keys, or a string containing a path to an external json.

# List of available extensions
* [ejs](#ejs) - Enable EJS template engine
* [graph](#graph) - Recursive operations on database
* [jwt](#jwt) - Authentication using JSON Web Tokens
* [jwt_delegate](#jwt_delegate) - Centralize authentication on a different server
* [last_activity](#last_activity) - Keep the time of users' last activity
* [markdown](#markdown) - Serve Markdown files as html using Marked
* [noauth](#noauth) - A user verification mechanism when authentication is disabled
* [restricted_keys](#restricted_keys) - Whitelist of writable keys depending on user class
* [static_routes](#static_routes) - Files and folders to be served by the server
* [ulid](#ulid) - Generate identifiers using ulid

Older extensions, less relevant but still functional 
* [es6-polyfills](#es6-polyfills) - Polyfills for older systems
* [nodemailer](#nodemailer) - Send emails using https://www.npmjs.com/package/nodemailer
* [prefer_https](#prefer_https) - Redirect every HTTP queries to HTTPS
* [user_setup](#user_setup) - Manage user password reset

# Detailed description of extensions

## ejs {#ejs}
Prepare Express to use the EJS template engine. Required by the markdown extension.
* default configuration
```js
"ejs": {
    "enable": true,
    "path": "./extensions/ejs.js",
    "conf": {
        "views": "extensions/ejs"
    }
}
```
* configuration options:
  * `views` (string) path to the directory containing .ejs files (usually containing pages/ and partials/ subfolders inside)

## es6-polyfills {#es6-polyfills}
Provide ES6 polyfills if the code is ran in a NodeJS which is not ES6.
(NodeJS v0.10.29 for instance, on older systems)
* default configuration:
```js
"es6_polyfills": {
    "enable": true,
    "path": "./extensions/es6_polyfills.js"
}
```

## graph
Handles recursive operations regarding nodes in the database.
* new routes: `/api/graphDelete`
* default configuration:
```js
"graph": { 
    "enable": true,
    "path": "./extensions/graph.js"
}
```
**Methods**
* `graphDelete(ids, callback)` | Delete specified nodes and any other node that might be associated

## jwt {#jwt}
Implementation of JSON Web Token RFC7519 for user authentication https://jwt.io/  
* requires `jsonwebtoken` `express-jwt` `express-unless` `crypto` `cookie-parser` `ms`
* new routes: `/api/signIn` and `/api/verify`
* default configuration:
```js
"jwt": {
    "enable": false,
    "path": "./extensions/jwt.js",
    "conf": {
        "required": true,
        "passwordHashAlgorithm": "sha1",
        "secret": "webtokensecret",
        "exp": "1d",
        "username": "^[a-z][-a-z0-9_]*\$",
        "expressUse": "/api",
        "expressUnless": {
            "path": "/api/signIn/"
        }
    }
}
```
* configuration options:
  * `required` (boolean) if false, unauthenticated users are considered as `guest` users with read access
  * `passwordHashAlgorithm` (string) algorithm used to hash the passwords on server. `sha1` or `md5`
  * `secret` (string)  encryption salt
  * `exp` (number) token default expiration time default is `1d`. See [ms⤴](https://www.npmjs.com/package/ms)
  * `username` (string) accepted RegExp pattern for usernames at authentication. If undefined, accept all strings.
  * `expressUse` (string, regex or array) paths to protect with authentication
  * `expressUnless` (object) paths and methods to exclude from authentication

See [Authentication](/docs/Authentication), [express.use syntax⤴](https://expressjs.com/en/api.html#app.use), [express unless syntax⤴](https://www.npmjs.com/package/express-unless).

### Enable User Authentication
By default, the installation gives a public access without user authentication. Here is the procedure to create a new user using the damas-core API and the damas command line interface:
```sh
$ echo -n "yourpassword" | sha1sum
327156ab287c6aa52c8670e13163fc1bf660add4  -
$ damas create '{"username":"yourusername", "password":"327156ab287c6aa52c8670e13163fc1bf660add4", "class":"admin"}'
```
Then enable the extension:
```js
{
    "jwt" : {
        "enable": true,
    }
}
```
And configure the options depending on the behavior you want. Restart the server and sign in using the newly created user. Read [Authentication](/docs/Authentication) to have more details about the authentication options and implementation.

## jwt_delegate {#jwt_delegate}
Centralizing authentication on a different server than the tracker.
The user node will be save in the tracker database or update [(learn more)](/docs/Authentication#signin).
* default configuration :
```js
"jwt_delegate": {
    "enable": true,
    "path": "./extensions/jwt_delegate.js",
    "conf": { 
        "server": "https://syncplanet.io/api/signIn/"
    }
},
```
* Create a new request and submit it to the server

## last_activity {#last_activity}
Save the date when user makes a request.
* default configuration:
```js
"last_activity": {
    "enable": true,
    "path": "./extensions/last_activity.js"
},
```

## markdown {#markdown}
Serve Markdown files as HTML, rendered using Marked and EJS. Resolves routes, README.md in directories and .md extension autocompletion.
* default configuration:
```js
"markdown": {
    "enable": true,
    "path": "./extensions/markdown.cjs",
    "conf": {
        "template": "pages/markdown.ejs",
        "title": "%s - damas-core",
        "routes": {
            "/api/": "../",
            "/": "../"
        }
    }
}
```
* configuration options:
  * `template` (string) encapsulate the rendered html with the specified EJS template
  * `title` (string) provide a document title (`%s` is replaced with title found in the document or with the filename)
  * `routes` (object) hash table with `route:path` to make correspond a route to a folder or .md
* extension files:
  * [markdown.cjs](markdown.cjs)
  * [markdown.mjs](markdown.mjs)
  * [markdown.ejs](ejs/pages/markdown.ejs)


## noauth {#noauth}
Provides basic user verification mechanisms when authentication is disabled.
* new routes: `/api/verify`
* default configuration:
```js
"noauth": {
    "enable": true,
    "path": "./extensions/auth-none.js"
}
```

## nodemailer {#nodemailer}
Send email using https://www.npmjs.com/package/nodemailer
* requires `nodemailer`
* default configuration:
```
"nodemailer": {
    "enable": true,
    "path": "./extensions/nodemailer.js",
    "conf": {
        "transporter":{
            "host": "localhost",
            "port": 25, 
            "secure": false
        },  
        "from": "\"Sender\" <noreply@example.com>"
    }   
}  
```
* configuration options:
  * `transporter` (object) nodemailer configuration
  * `from` (string) default sender email address
See [nodemailer⤴](https://www.npmjs.com/package/nodemailer)

## restricted_keys {#restricted_keys}
Replace keys in requests by default ones if the user class is not in the whitelist. If the new value is defined as null, delete the key from the request
* default configuration:
```js
"restricted_keys": {
    "enable": true,
    "path": "./extensions/restricted_keys.js",
    "conf": {
        "whitelist": ["admin"],
        "override": { "active": false, "author": null, "class": null, "time": null, "username": null }
    }
}
```
* configuration options:
  * `whitelist` (array) user classes that are not affected by key restriction
  * `override` (object) keys and behaviors upon updates

## prefer_https {#prefer_https}
Redirects http:// calls to https://.
* default configuration:
```js
"prefer_https": {
    "enable": false,
    "path": "./extensions/prefer_https.js"
}
```
The /.well-known is not redirected to allow letsencrypt authentication. See Express [res.redirect⤴](https://expressjs.com/en/api.html#res.redirect)

## Enable TLS
For a server which will run on a network you should enable the security layer in conf.json:
```json
{
    "https" : { 
        "enable": true,
        "cert": "fullchain.pem",
        "key": "privkey.pem"
    }
}
```
You can use Let's Encrypt to obtain a certificate:
```sh
docker run --rm --name certbot -p 80:80 -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt certbot/certbot certonly -q --standalone --agree-tos -m YOUR@EMAIL.COM -d YOUR_DOMAIN_NAME
```

Or generate a self signed certificate:
```sh
openssl req -new -x509 -days 9999 -nodes -out fullchain.pem -keyout privkey.pem
```







## static_routes {#static_routes}
A list of relative or absolute paths to be served by the server. It contains server resources and possible HTML interfaces.
* new routes are defined according to the configuration
* default configuration:
```js
"static_routes": {
    "enable": true,
    "path": "./extensions/static_routes.js",
    "conf": {
        "routes": {
            "/": "public",
            "/js": "../js",
            "/cli": "../cli",
            "/py": "../py",
            "/api": "public/index.html",
            "/signIn": "extensions/auth_signIn.html"
        }
     }
}
```
* configuration options:
  * `routes` (object) route -> path pairs to define
An array as value for a directory means that it will look for a resource in each directory by order of appearance. 


## ulid {#ulid}
Generate identifiers using ulid (https://github.com/ulid/spec)
* default configuration:
```js
"ulid": {
    "enable": true,
    "path": "./extensions/ulid.js",
    "conf": {
        "replacedPattern": "{#}"
    }
}
```
* configuration options:
  * `replacedPattern` (string) the text pattern to replace with the generated ulid identifier
* example:
```js
// create a new node, _id containing the pattern to replace by a ulid
damas.create({_id:"node_{#}"});
// return
// Object { _id: "node_01GW9F73XCD5FHNJSHTQHAQNA5" }
```

## user_setup {#user_setup}
Lost password procedure using email and token verification.
* requires `crypto`
* new routes: `/api/lostPassword` `/api/changePassword` `/api/resetPassword`
* default configuration:
```json
"user_setup" : { 
    "enable": true,
    "path" : "./extensions/user_setup.js"
}
```
