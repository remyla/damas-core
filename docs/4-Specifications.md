Specifications
==============

The damas-core clients and servers communicate using the [JSON data-interchange format](http://json.org) over [HTTP](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol), with a REST architecture and basic CRUD operations. A damas-core server can provide some extra operations, defined in the extensions loaded at startup.

# Set of operations

|PATH|METHOD|PARAMS|RESPONSE STATUS CODE|
|---|-----|--|-|
| <br/>CRUD ||
| [/api/create/](#create)                   | POST      | JSON       | 201, 207, 400, 403, 409, 500 |
| [/api/read/](#read)                       | GET, POST | URL, JSON  | 200, 207, 400, 403, 404, 500 |
| [/api/update/](#update)                   | PUT       | JSON       | 200, 207, 400, 403, 404, 500 |
| [/api/upsert/](#upsert)                   | POST      | JSON       | 200, 400, 403, 500 |
| [/api/delete/](#delete)                   | DELETE    | JSON       | 200, 207, 400, 404, 500 |
| <br/>JWT 🧩 ||
| [/api/createToken/](#createToken)         | POST      | JSON       | 200 |
| [/api/signIn/](#signIn)                   | POST      | FORM       | 200, 401, 404 |
| [/api/verify/](#verify)                   | GET       | -          | 200, 401 |
| <br/>SEARCH ||
| [/api/graph/](#graph) ⚠️                   | GET       | URL        | 200, 207, 400, 404, 500 |
| [/api/graph_backwards/](#graph_backwards) | GET       | URL        | 200, 207, 400, 404, 500 |
| [/api/graph_forwards/](#graph_forwards)   | GET       | URL        | 200, 207, 400, 404, 500 |
| [/api/search/](#search)                   | GET       | URL        | 200, 400, 500 |
| [/api/search_one/](#search_one)           | GET       | URL        | 200, 400, 500 |
| [/api/search_mongo/](#search_mongo)       | POST      | JSON       | 200, 500, 501 |

🧩 The JWT operations are defined in the [JWT extension](../server-nodejs/extensions/#jwt) for the [user authentication mecanism](Authentication.md)  
⚠️ Deprecated operation (see replacement in the operation's details)

# Details
## create {#create}
Insert new element(s) in the database. The elements have an `_id` key being their unique string identifier in the database. This key can be specified during creation, but can't be updated afterwards without first deleting the element. If it is not provided, it will be set with a default unique identifier string. The server may add some other arbitrary keys (like `author`, `time`) at creation depending on its configuration. To create multiple elements you can provide an array of objects as input and also provide an array of strings as `_id` keys that will be unfolded at creation time.

### HTTP Requests
* `POST` `/api/create/` `application/json` object or array of objects

### HTTP Responses
```http
201 Created               application/json (string or array of strings) created object(s) identifiers
207 Multi-Status          application/json (array of objects and null) some objects already exist
400 Bad Request           text/html (error message) not formatted correctly
403 Forbidden             text/html (error message) the user does not have the right permission
409 Conflict              text/html (error message) all objects already exist with these identifiers
500 Internal Server Error text/html (error message) error while accessing the database
```

> Returns the created element's identifier or an array containing the created elements identifiers in case of a multiple creation request.

> In case of a multiple element creation, the returned JSON is an array of strings ordered using the same order as the input array.

> [!NOTE]
> 207 Multi-Status happens when some specified identifiers already exist. A null value is returned in the array at corresponding position

## read {#read}
Retrieve one or more elements giving their identifier(s). In addition to the GET method, a POST method is provided to avoid the limitation of the URL length.

### HTTP Requests
* `GET` `/api/read/id1,id2`
* `POST` `/api/read/` `application/json` identifier string or array of identifier strings

> The HTTP headers are often limited by HTTP servers to a maximum size. NodeJS maximum header size is 80KB. The POST method is provided to avoid this limitation in order to read large numbers of identifiers.

### HTTP Responses
```http
200 OK                    application/json (objects or array of objects) requested object(s)
207 Multi-Status          application/json (array of objects and null) some objects do not exist
400 Bad Request           text/html (error message) not formatted correctly
403 Forbidden             text/html (error message) the user does not have the right permission
404 Not Found             text/html (error message) object(s) do not exist
500 Internal Server Error text/html (error message) error while accessing the database
```

> The requested element is returned if found. In case of a request for multiple elements, an array in same order as input is returned.

## update {#update}
Add, modify and remove keys on element(s) identified by their `_id` key. Keys are overwritten if they exist on the server. Specifying `null` as value removes the key. Unspecified keys are left untouched on the server. Providing an array of objects or an array of identifiers modify multiple elements with one request.

### HTTP Requests
* `PUT` `/api/update/` `application/json` object or array of objects

### HTTP Responses
```http
200 OK                    application/json (object or array of objects) updated object(s)
207 Multi-Status          application/json (array of objects or nulls) some objects do not exist
400 Bad Request           text/html (error message) not formatted correctly
403 Forbidden             text/html (error message) the user does not have the right permission
404 Not Found             text/html (error message) object(s) do not exist
500 Internal Server Error text/html (error message) error while accessing the database
```

> The modified element is returned. In case of a multiple element update an array in same order as input is returned.

## upsert {#upsert}
Create or modify existing element(s). The input can be a single object, an array, and can use arrays for `_id` keys (similar to update). If the element is not found in the database, it is created.

### HTTP Requests
* `POST` `/api/upsert/` `application/json` object or array of objects

### HTTP Responses
```http
200 OK                    application/json (object or array of objects) updated/created object(s)
400 Bad Request           text/html (error message) not formatted correctly
403 Forbidden             text/html (error message) the user does not have the right permission
500 Internal Server Error text/html (error message) error while accessing the database
```
> The input accepts arrays for _id keys, as well as values "null".

## delete {#delete}
Permanently remove one or more elements from the database specifying their identifier(s).

### HTTP Requests
* `DELETE` `/api/delete/` `application/json` identifier string or array of identifier strings

### HTTP Responses
```http
200 OK                    application/json (string or array of strings) deleted identifier(s)
207 Multi-Status          application/json (array of strings or null) some objects do not exist
400 Bad Request           text/html (error message) not formatted correctly
404 Not Found             text/html (error message) object(s) do not exist
500 Internal Server Error text/html (error message) could not access the database
```

## graph {#graph}
Deprecated. Use the equivalent operation [`graph_backwards`](#graph_backwards) below.

## graph_backwards {#graph_backwards}
Recursively get all source nodes and edges connected to the specified node

### HTTP Requests
* `GET` `/api/graph_backwards/<depth>/<id1,id2>`
* `POST` `/api/graph_backwards/<depth>` `application/json` identifier string or array of identifier strings

> The HTTP headers are often limited by HTTP servers to a maximum size. NodeJS maximum header size is 80KB. The POST method is provided to avoid this limitation in order to read large numbers of identifiers.

### HTTP Responses
```http
200 OK                    application/json (array of identifiers) identifiers of the connected object(s) in the requested graph
207 Multi-Status          application/json (array of identifiers and null) some objects do not exist
400 Bad Request           text/html (error message) not formatted correctly
403 Forbidden             text/html (error message) the user does not have the right permission
404 Not Found             text/html (error message) object(s) do not exist
500 Internal Server Error text/html (error message) error while accessing the database
```

## graph_forwards {#graph_forwards}
Recursively get all target nodes and edges connected to the specified node

### HTTP Requests
* `GET` `/api/graph_forwards/<depth>/<id1,id2>`
* `POST` `/api/graph_forwards/<depth>` `application/json` identifier string or array of identifier strings

> The HTTP headers are often limited by HTTP servers to a maximum size. NodeJS maximum header size is 80KB. The POST method is provided to avoid this limitation in order to read large numbers of identifiers.
### HTTP Responses
```http
200 OK                    application/json (array of identifiers) identifiers of the connected object(s) in the requested graph
207 Multi-Status          application/json (array of identifiers and null) some objects do not exist
400 Bad Request           text/html (error message) not formatted correctly
403 Forbidden             text/html (error message) the user does not have the right permission
404 Not Found             text/html (error message) object(s) do not exist
500 Internal Server Error text/html (error message) error while accessing the database
```

## search_one {#search_one}

### HTTP Requests
* `GET` `/api/search_one/` `query`

### HTTP Responses
```http
200 OK                    application/json (object or null)
400 Bad Request           text/html error message
409 Conflict              text/html error message
500 Internal Server Error text/html (error message) could not access the database
```

## search_mongo {#search_mongo}
### HTTP Requests
* `POST` `/api/search_mongo` `application/json` `query` `sort` `limit` `skip`
### HTTP Responses
```http
200 OK                    application/json (array of string identifiers)
409 Conflict              text/html error message
500 Internal Server Error text/html (error message) could not access the database
501 Not Implemented       text/html (error message) the operation is not available
```

## createToken {#createToken}
Request a new authentication token from the server, while being already authenticated, specifying a lifespan (see [ms package](https://npmjs.com/package/ms) time format), 0 for an unlimited lifespan.
### HTTP Requests
* `POST` `/api/createToken/` `application/json` `expiresIn`
### HTTP Responses
```http
200 OK application/json (string) the newly generated token
```

## signIn {#signIn}
Request a token from the server, providing a username and password

### HTTP Requests
* `POST` `/api/signIn/` `application/x-www-form-urlencoded` `username` `password` `lifespan`

### HTTP Responses
```http
200 OK             application/json (object)
401 Unauthorized   text/html error message
404 Not Found      text/html error message
```
> `404` error code is return if no authentication is required.

## verify {#verify}
Check if the user has a token

### HTTP Requests
* `GET` `/api/verify/`

### HTTP Responses
```http
200 OK             application/json  (the authenticated user object)
401 Unauthorized   text/html error message
```
