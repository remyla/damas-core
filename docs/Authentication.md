JSON Web Token User Authentication
===

The user authentication in damas-core is based upon the JSON Web Token (RFC 7519) authentication and secure transmission. You can find some resources here:
* [JSON Web Token⤴](https://en.wikipedia.org/wiki/JSON_Web_Token) - Wikipedia page
* [jwt.io⤴](https://jwt.io/) - and [Introduction⤴](https://jwt.io/introduction/)
* [npmjs jsonwebtoken⤴](https://www.npmjs.com/package/jsonwebtoken) - JWT module for NodeJS

The implementation of this RFC is found in the [jwt damas-core extension](../server-nodejs/extensions/#jwt). Please find below some documentation about it.

# Web Tokens
The tokens are delivered by the server using the [signIn](4-Specifications.md#signIn) operation to authenticate users.

## Lifespan
The default value for tokens' lifespan can be set in the server's conf.json under `extensions.jwt.exp`, and its value is "1d" (1 day) by default. See the syntax and examples [here⤴](https://www.npmjs.com/package/ms). This value can also be specified during signIn, using the `expiresIn` parameter, in order to retrieve a token with the desired lifespan. A value of "0" ask for a token with an unlimited lifespan (see [#237⤴](https://github.com/remyla/damas-core/issues/237)). By changing password, this revokes previously obtained tokens.  

## Revoke
Changing the user's password revokes every tokens previously created. This is because the salt used to generate the tokens is also made of the user's hashed password value. This way, we provide a simple and secure way to revoke every tokens at once for a user without adding more complex operations.

## Salt
The tokens are encrypted using a salt composed of a secret passphrase specified on the server under `extension.jwt.secret`, and the users' hashed passwords. If we change either one, every previously obtained tokens is revoked.

# Users
The users are regular elements we can create, update or delete using the API.
```json
{
    "_id" : "usr/axel"
    "class": "user",
    "lastActivity": 1561237341643,
    "lastlogin": 1561237340643,
    "password" : "55ae0b1ed81e88357d77d0e9",
    "username": "axel"
}
```
Some keys can be added to users elements by the server, depending on its configuration: `lastActivity`, `lastLogin`.

## Passwords
The users' passwords are stored in the database under a `password` key for each user element. The passwords are stored as encoded strings, using the `sha1` or `md5` hash algorithms. You can specify the preferred algorithm in `extensions.jwt.passwordHashAlgorithm`. The algorithm is automatically detected at signIn (using the hash length) so a mix of methods could exist in the database (this is useful to migrate or merge multiple user databases that use different hash algorithms).

To create a new user using Python:
```python
import damas
import hashlib
project = http_connection("http://localhost")
p = hashlib.sha1()
p.update('johnpassword')
project.create({"username":"john", "password": p.hexdigest(), "email":"john@me.com" })
```
Delete this user (given his username):
```python
project.delete(project.search("username:john")[0])
```
Request a token for a user:
```python
if project.signIn("john","johnpassword"):
    # The token is automatically used in further API calls
    new_node = project.create({"key":"value")
else:
    print "Invalid username or password"
```
⚠️ In case of a server running on Internet or untrusted network, use secure communication (https://). Else the password is sent as clear text.

Ask the server if the current authentication is still valid and didn't expire:
```python
# Python
if project.verify():
    print "ok"
else:
    print "token expired"
```

# Classes & Permissions
Different types of permissions are available:
* hard-coded permissions for each /api/ operation based on the current user's `class` key (in server-nodejs/routes/perms-tools.js)
* extension for update permissions based on the modified key name and the user's `class` key. See [restricted_keys extension](../server-nodejs/extensions/#restricted_keys).
* read permissions based on the `author` key. See conf.json `authorMode` directive.

The available user classes are: `admin` `editor` `user` `guest`.

|  Operation   | guest | user | editor | admin |
|--------------|-------|------|--------|-------|
|    create    |       |   x  |    x   |   x   |
|     read     |   x   |   x  |    x   |   x   |
|    update    |       |   k  |    x   |   x   |
|    delete    |       |      |    x   |   x   |
|     graph    |   x   |   x  |    x   |   x   |
|    search    |   x   |   x  |    x   |   x   |
| search_mongo |   x   |   x  |    x   |   x   |


# Miscellaneous Information

## Details about the Python implementation
```python
# Python
project.token['username']  # The user name used to log in
project.token['token']     # The actual encrypted json web token
project.token['token_exp'] # The time at which the token expires (Unix timestamp in seconds)
project.token['token_iat'] # The time when the token was generated
project.token['_id']       # The user node id
```

## Another extension: authentication delegation
The [jwt_delegate](../server-nodejs/extensions/#jwt_delegate) extension can be additionally used to centralize the authentication on a different server. When an user signs in, instead of authenticating him against the local database, the extension creates a new request that is sent to the delegation server. Once the user is authenticated, its element is copied in the local server, as if the user was authenticated locally.


## Use the token inside your custom curl Commands
1. Request an access token from the server:
```sh
$ curl https://localhost/api/signIn -d "username=remyla&password=yyy" > /tmp/token
```

2. Read the token:
```sh
$ cat /tmp/token
{"_id":"56029d03dff07e50a860a09d","username":"remyla","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjAyOWQwM2RmZjA3ZTUwYTg2MGEwOWQiLCJ1x2VybmFtZSI6InJlbXlsYSIsImlhdCI6MTQ1NDA3ODY1MiwiZXhwIjoxNDU0MTY1MDUyfQ.5AhJIh6ReeS2y6H0Mpcx8fJralsTDSidJAniuaJiVP8","token_exp":1454165052,"token_iat":1454078652}
```

3. Use the token:
```sh
$ curl https://localhost/api/verify -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjAyOWQwM2RmZjA3ZTUwYTg2MGEwOWQiLCJ1x2VybmFtZSI6InJlbXlsYSIsImlhdCI6MTQ1NDA3ODY1MiwiZXhwIjoxNDU0MTY1MDUyfQ.5AhJIh6ReeS2y6H0Mpcx8fJralsTDSidJAniuaJiVP8"
{"_id":"56029d03dff07e50a860a09d","username":"remyla","iat":1454078652,"exp":1454165052}
```
