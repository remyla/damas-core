/**
 * REST API Testing using Frisby.js - Assigning values to variables in conf.json file
 * Remember: You must configure the parameters and variables in conf-tests-frisby.
 * @requires module:frisby
 * @requires ./conf.json
 */
 var frisby = require('frisby'),
conf = require('./conf-tests-frisby');

//To test with https
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


//START: --------------VARIABLES--------------
var url = conf.protocol + '://' + conf.host + ':' + conf[conf.protocol].port +
          '/' + conf.path;
var idCustom = '/file/;.*?<>#%';
var idCustomEncoded = encodeURIComponent(idCustom);
var idNotFoundinDb = 100000001;
var asJSON = {'json': true};
var tjson = 'application/json';
//END: ----------------VARIABLES--------------


/*frisby.create('/api/signin')
    .post(url+'/signIn', {'username': 'demo', 'password': 'demo'} )
    .expectStatus(200)
    .after(function (error, response, body) {
        token = body.token;
    }).toss();
*/

/**
 * Tests for method Create
 */
frisby.create('CREATE - should create an object in the database')
    .addHeader('Content-Type', tjson)
    .post(url + 'create/', {'key': 'value', 'num': 3}, asJSON)
    .expectStatus(201)
    .expectHeaderContains('Content-Type', tjson)
    .expectJSON({
        'key': 'value',
        'num': 3
    })
    .after(function (error, response, body) {

    var res = response.body,
    idFoundInDb = res._id || res.id;

    frisby.create('CREATE - should create an object with JSON Empty)')
        .addHeader('Content-Type', tjson)
        .post(url + 'create/', {}, asJSON)
        .expectHeaderContains('Content-Type', tjson)
        .expectStatus(201)
    .toss();

    //we can only post objects and arrays...
    frisby.create('CREATE - should throw an error (JSON expected, string found)')
        .addHeader('Content-Type', tjson)
        .post(url + 'create/', ['Foo'], asJSON)
        .expectStatus(400)
    .toss();

    frisby.create('CREATE - should create an object in database with custom id')
        .addHeader('Content-Type', tjson)
        .post(url + 'create/', {'_id': idCustom}, asJSON)
        .expectHeaderContains('Content-Type', tjson)
        .expectStatus(201)
    .toss();

    frisby.create('CREATE - should throw an error (node already exist)')
        .addHeader('Content-Type', tjson)
        .post(url + 'create/', {'_id': idCustom}, asJSON)
        .expectStatus(409)
    .toss();

    /**
      * Tests for method Read
      */
    frisby.create('READ - should throw an error (id empty) - Not found')
        .get(url + 'read/')
        .expectStatus(404)
    .toss();

    //it always return a non empty array
    frisby.create('READ - should throw an error (id not found) - Not found')
        .get(url + 'read/' + idNotFoundinDb)
        .expectStatus(404)
    .toss();

    frisby.create('READ - should throw an error (id not found) - Not found - GET')
        .get(url + 'read/' + idCustom)
        .expectStatus(404)
    .toss();

    frisby.create('READ - should get a record valid - GET')
        .get(url + 'read/' + idFoundInDb)
        .expectStatus(200)
        .expectHeaderContains('Content-Type', tjson)
    .toss();

    frisby.create('READ - should get a record valid with custom id - GET')
        .get(url + 'read/' + idCustomEncoded)
        .expectStatus(200)
        .expectHeaderContains('Content-Type', tjson)
    .toss();

    frisby.create('READ - should get a record valid with custom id - POST')
        .addHeader('Content-Type', tjson)
        .post(url + 'read/', [idCustom], asJSON)
        .expectStatus(200)
        .expectHeaderContains('Content-Type', tjson)
    .toss();

    frisby.create('READ - should get 2 records valid - GET')
        .get(url + 'read/' + idFoundInDb + ',' + idCustomEncoded)
        .expectStatus(200)
        .expectHeaderContains('Content-Type', tjson)
        .expectJSONTypes({
            0: Object,
            1: Object
        })
    .toss();

    frisby.create('READ - should get 2 records valid - POST')
        .addHeader('Content-Type', tjson)
        .post(url + 'read/', [idFoundInDb,idCustom], asJSON)
        .expectStatus(200)
        .expectHeaderContains('Content-Type', tjson)
        .expectJSONTypes({
            0: Object,
            1: Object
        })
    .toss();

    /**
     * Tests for method Update
     */
    frisby.create('UPDATE - should throw an error (id empty, no data send)')
        .addHeader('Content-Type', tjson)
        .put(url + 'update/', {}, asJSON)
        .expectStatus(400)
    .toss();

    frisby.create('UPDATE - should throw an error (invalid custom id)')
        .addHeader('Content-Type', tjson)
        .put(url + 'update/' + idCustom, {'key' : 'val'}, asJSON)
        .expectStatus(404)
    .toss();

    frisby.create('UPDATE - should throw an error (format data invalid) with valid id')
        .addHeader('Content-Type', tjson)
        .put(url + 'update/' + idFoundInDb, {}, asJSON)
        .expectStatus(400)
    .toss();

    frisby.create('UPDATE - should throw an error (id not found)')
        .addHeader('Content-Type', tjson)
        .put(url + 'update/' + idNotFoundinDb, {'key': 'val'}, asJSON)
        .expectStatus(404)
    .toss();

    frisby.create('UPDATE - should throw an error (null data) with valid id')
        .put(url + 'update/' + idFoundInDb)
        .expectStatus(400)
    .toss();

    frisby.create('UPDATE - should update a document - data valid, id valid')
        .addHeader('Content-Type', tjson)
        .put(url + 'update/' + idFoundInDb, {'a':'c'}, asJSON)
        .expectHeaderContains('Content-Type', tjson)
        .expectJSON({'a': 'c'})
        .expectStatus(200)
    .toss();

    frisby.create('UPDATE - should update a document with an integer')
        .addHeader('Content-Type', tjson)
        .put(url + 'update/' + idFoundInDb, {'b': 2}, asJSON)
        .expectHeaderContains('Content-Type', tjson)
        .expectJSON({'b': 2})
        .expectStatus(200)
    .toss();

    frisby.create('UPDATE - should update a document - data valid, custom id valid')
        .addHeader('Content-Type', tjson)
        .put(url + 'update/' + idCustomEncoded, {'a':'c'}, asJSON)
        .expectHeaderContains('Content-Type', tjson)
        .expectStatus(200)
    .toss();

    frisby.create('UPDATE - should update 2 documents')
        .addHeader('Content-Type', tjson)
        .put(url + 'update/' + idFoundInDb + ',' + idCustomEncoded, {'c':'d'},
            asJSON)
        .expectHeaderContains('Content-Type', tjson)
        .expectJSONTypes('*', {'c':'d'})
        .expectStatus(200)
    .toss();

     /**
      * Tests for method Graph
      */
    //it always return a non empty array
    frisby.create('GRAPH - should throw an error (id empty) - Bad Request')
        .get(url + 'graph/')
        .expectStatus(400)
    .toss();

    frisby.create('GRAPH - should throw an error (id not found) - Not found')
        .get(url + 'graph/' + idNotFoundinDb)
        .expectStatus(404)
    .toss();

    frisby.create('GRAPH - should throw an error (id empty) - Not found')
        .get(url + 'graph/' + idCustom)
        .expectStatus(404)
    .toss();

    frisby.create('GRAPH - should get a record valid')
        .get(url + 'graph/' + idFoundInDb)
        .expectStatus(200)
        .expectHeaderContains('Content-Type', tjson)
    .toss();

    frisby.create('GRAPH - should a record valid with custom id')
        .get(url + 'graph/' + idCustomEncoded)
        .expectStatus(200)
        .expectHeaderContains('Content-Type', tjson)
    .toss();

    frisby.create('GRAPH - should get 2 records valid')
        .get(url + 'graph/' + idFoundInDb + ',' + idCustomEncoded)
        .expectStatus(200)
        .expectHeaderContains('Content-Type', tjson)
        .expectJSONTypes({
            0: Object,
            1: Object
        })
    .toss();

    /**
      * Tests for method Lock
      */
    frisby.create('LOCK - should throw an error (id empty) - Bad request')
        .put(url + 'lock/')
        .expectStatus(400)
    .toss();

    //Fatal error
/*    frisby.create('LOCK - should throw an error (id not found) - Not found')
        .put(url + 'lock/' + idNotFoundinDb)
        .expectStatus(404)
    .toss();
*/
    frisby.create('LOCK - should throw an error (id empty) - Not found')
        .put(url + 'lock/' + idCustom)
        .expectStatus(404)
    .toss();

    frisby.create('LOCK - should lock the asset')
        .put(url + 'lock/' + idFoundInDb)
        .expectStatus(200)
    .toss();

    frisby.create('LOCK - should lock the asset with custom id')
        .put(url + 'lock/' + idCustomEncoded)
        .expectStatus(200)
    .toss();

    frisby.create('LOCK - should throw an error (already locked)')
        .put(url + 'lock/' + idCustomEncoded)
        .expectStatus(409)
    .toss();

    /**
      * Tests for method Unlock
      */
    frisby.create('UNLOCK - should throw an error (id empty) - Bad request')
        .put(url + 'unlock/')
        .expectStatus(400)
    .toss();

    //Fatal error
/*    frisby.create('UNLOCK - should throw an error (id not found) - Not found')
        .put(url + 'unlock/' + idNotFoundinDb)
        .expectStatus(404)
    .toss();
*/
    frisby.create('UNLOCK - should throw an error (id empty) - Not found')
        .put(url + 'unlock/' + idCustom)
        .expectStatus(404)
    .toss();
    frisby.create('UNLOCK - should unlock the asset')
        .put(url + 'unlock/' + idFoundInDb)
        .expectStatus(200)
    .toss();

    frisby.create('UNLOCK - should unlock the asset with custom id')
        .put(url + 'unlock/' + idCustomEncoded)
        .expectStatus(200)
    .toss();

    frisby.create('UNLOCK - should throw an error (already unlocked)')
        .put(url + 'unlock/' + idCustomEncoded)
        .expectStatus(409)
    .toss();

    /**
     * Tests for method Delete
     */
    frisby.create('DELETE - should throw an error (id empty) - Bad Request')
        .delete(url + 'delete/')
        .expectStatus(400)
    .toss();

    frisby.create('DELETE - should throw an error (id valid but not found in the DB)')
        .delete(url + 'delete/' + idNotFoundinDb)
        .expectStatus(404)
    .toss();

    frisby.create('DELETE - should delete a document with an id valid')
        .delete(url + 'delete/' + idFoundInDb)
        .expectStatus(200)
    .toss();

    frisby.create('DELETE - should delete a document with a custom id valid')
        .delete(url + 'delete/' + idCustomEncoded)
        .expectStatus(200)
    .toss();

    /**
     * Tests for methods Create and Delete with multiple parameters
     */
    frisby.create('CREATE - should create 2 objects in the database')
        .addHeader('Content-Type', tjson)
        .post(url + 'create/', [
            {'key': 'value', num: 3},
            {'_id': idCustom, 'key': 'value', num: 3}
         ], asJSON)
        .expectStatus(201)
        .expectHeaderContains('Content-Type', tjson)
        .expectJSON('*', {
            'key': 'value',
            'num': 3
        })
        .after(function (error, response, body) {

        var res = response.body,
        idFoundInDb = res[0]._id;

        frisby.create('DELETE - should delete 2 documents')
            .delete(url + 'delete/' + idFoundInDb + ',' + idCustomEncoded)
            .expectStatus(200)
        .toss();

        frisby.create('CREATE - should throw an error (duplicate id)')
            .addHeader('Content-Type', tjson)
            .post(url + 'create/',
                [{'_id': idCustom, 'key': 'value'}, {'_id': idCustom}], asJSON)
            .expectStatus(207)
            .expectHeaderContains('Content-Type', tjson)
            .after(function (error, response, body) {

            frisby.create('DELETE - should throw an error (not all document deleted)')
                .delete(url + 'delete/' + idCustomEncoded + ',' + idNotFoundinDb)
                .expectStatus(207)
            .toss();

        }).toss();

    }).toss();
}).toss();
