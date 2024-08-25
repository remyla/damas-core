/*
 * REST API Testing using Frisby.js
 * Configuration: conf-tests.js
 */

var frisby = require('frisby'),
conf = require('./conf-tests');

//To test with https
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


/*
 * Variables
 */
var url = conf.protocol + '://' + conf.host + ':' + conf[conf.protocol].port +
          '/' + conf.path;
var idCustom = '/file/;.*?<>#%';
var idCustomEncoded = encodeURIComponent(idCustom);
const idNotFound = '123456789012';

/*
 * Utility functions to ease test creation
 */
function create(desc, data) {
    return frisby.create('POST CREATE - ' + desc)
        .post(url + 'create/', data, {json: true});
}

function read(desc, data) {
    return frisby.create('POST READ - ' + desc)
        .post(url + 'read/', data, {json: true});
}

function update(desc, data) {
    return frisby.create('PUT UPDATE - ' + desc)
        .put(url + 'update/', data, {json: true});
}

function upsert(desc,data) {
    return frisby.create('POST UPSERT - ' + desc)
        .post(url + 'upsert/', data, {json: true});
}

function remove(desc, data) {
    return frisby.create('DELETE REMOVE - ' + desc)
        .delete(url + 'delete/', data, {json: true});
}

function comment(desc, data) {
    return frisby.create('POST COMMENT - ' + desc)
        .post(url + 'comment/', data, {json: true});
}

function graph(desc, data) {
    return frisby.create('POST GRAPH - ' + desc)
        .post(url + 'graph/0/', data, {json: true});
}

function lock(desc, data) {
    return frisby.create('PUT LOCK - ' + desc)
        .put(url + 'lock/', data, {json: true});
}

function unlock(desc, data) {
    return frisby.create('PUT UNLOCK - ' + desc)
        .put(url + 'unlock/', data, {json: true});
}

function version(desc, parent, keys) {
    return frisby.create('POST VERSION - ' + desc)
        .post(url + 'version/' + parent, keys, {json: true});
}

function read_get(desc, uri) {
    uri = Array.isArray(uri) ? uri.join(',') : uri;
    return frisby.create('GET READ - ' + desc).get(url + 'read/' + uri);
}

function graph_get(desc, uri) {
    uri = Array.isArray(uri) ? uri.join(',') : uri;
    return frisby.create('GET GRAPH - ' + desc).get(url + 'graph/0/' + uri);
}

function search(desc, query) {
    query = encodeURIComponent(query);
    return frisby.create('GET SEARCH - ' + desc).get(url + 'search/' + query);
}

create('should create an object in the database', {key: 'value', num: 3})
    //.expectStatus(201).expectJSON('value', num: 3})
    //.expectStatus(201).expectJSON({key: 'value', num: 3})
    .after(function (error, response, body) {

    //var idFound = body._id;
    var idFound = body;

    create('should create an empty object', {})
    .expectStatus(201).after(function (error, response, body) {

    //var idFound2 = body._id;
    var idFound2 = body;

    /*
     * Create tests
     */
    create('should throw an error ([{}] | {} expected)', [null])
        .expectStatus(400).toss();

    create('should throw an error (objects expected)', ['abc'])
        .expectStatus(400).toss();

    create('should throw an error (objects expected)', [{}, 'abc'])
        .expectStatus(400).toss();

    create('should create an object with custom id', {_id: idCustom})
        .expectStatus(201).toss();

    create('should throw an error (node already exists)', {_id: idCustom})
        .expectStatus(409).toss();
    // */

    /*
     * Read tests
     */
    read_get('should throw an error (missing id)', '')
        .expectStatus(400).toss();
    read('should throw an error (missing id)', [])
        .expectStatus(400).toss();
    read('should throw an error (missing id)', {})
        .expectStatus(400).toss();
    read('should throw an error (invalid id)', [{a: null}])
        .expectStatus(400).toss();

    read_get('should throw an error (id not found)', idNotFound)
        .expectStatus(404).toss();
    /*read('should throw an error (id not found)', idNotFound)
        .expectStatus(404).toss();*/

    read_get('should throw an error (id not found)', idCustom)
        .expectStatus(404).toss();

    read_get('should get a valid node', idFound)
        .expectStatus(200).toss();

    read_get('should get a valid node with custom id', idCustomEncoded)
        .expectStatus(200).toss();
    /*read('should get a valid node with custom id', idCustom)
        .expectStatus(200).toss();*/

    read_get('should get two nodes', [idFound, idCustomEncoded])
        .expectStatus(200)
        .expectJSONTypes({0: Object, 1: Object})
    .toss();
    read('should get two nodes', [idFound, idCustom])
        .expectStatus(200)
        .expectJSONTypes({0: Object, 1: Object})
    .toss();
    // */

    /*
     * Update tests
     */
    update('should throw an error (empty data)', {})
        .expectStatus(400).toss();
    update('should throw an error (invalid data)', {_id: idFound})
        .expectStatus(400).toss();

    update('should throw an error (not found)', {_id: idNotFound, key: 'val'})
        .expectStatus(404).toss();

    update('should update a node (valid)', {_id: idFound, '#parent': idFound})
        .expectStatus(200).expectJSON({'#parent': idFound}).toss();

    update('should update a node with an integer', {_id: idFound, b: 2})
        .expectStatus(200).expectJSON({b: 2}).toss();

    update('should update a custom-id node', {_id: idCustom, a: 'c'})
        .expectStatus(200).expectJSON({a: 'c'}).toss();

    update('should update two nodes', {_id: [idFound, idCustom], c: 'd'})
        .expectStatus(200).expectJSONTypes('*', {c: 'd'}).toss();
    // */

    /*
     * Upsert tests
     */
    upsert('should throw an error ([{}] | {} expected)', [null])
        .expectStatus(400).toss();
    upsert('should throw an error (objects expected)', ['abc'])
        .expectStatus(400).toss();
    upsert('should throw an error (objects expected)', [{}, 'abc'])
        .expectStatus(400).toss();
    upsert('should update a node with an integer', {_id: idFound, b: 2})
        .expectStatus(200).expectJSON({b: 2}).toss();
    upsert('should create a node with custom id', {_id: 'null'})
        .expectStatus(200).toss();
    upsert('should create nodes with custom id', {_id: ['null', 'null'], c: 'd'})
        .expectStatus(200).toss();
        //.expectStatus(200).expectJSONTypes('*', {c: 'd'}).toss();
    upsert('should create a node and update a node', {_id: [idFound, 'null'], b: 'a'})
        .expectStatus(200).expectJSONTypes('*', {b: 'a'}).toss();
    upsert('should create a node and update a node', {_id: [idFound, idCustom], b: 'a'})
        .expectStatus(200).expectJSONTypes('*', {b: 'a'}).toss();
    // */

    /*
     * Comment tests
     *
     */
    comment('should throw an error (comment empty)',
            {'#parent': idFound, 'comment': ''})
        .expectStatus(400).toss();
    comment('should throw an error (no comment)', {'#parent': idFound})
        .expectStatus(400).toss();
    comment('should throw an error (no parent)', {'comment': 'a'})
        .expectStatus(400).toss();
    comment('should throw an error (parent not found)',
            {'#parent': idNotFound, 'comment': 'a'})
        .expectStatus(404).toss();
    comment('should throw an error (no parent found)',
            {'#parent': [idNotFound], 'comment': 'a'} )
        .expectStatus(404).toss();
    /*comment('should add half the comment',
            [{'#parent': idFound, 'comment': 'a'},
            {'#parent': idNotFound, 'comment': 'b'}])
        .expectStatus(207)
        .after(function (error, response, body) {
            remove('', body[0]._id);
        }).toss();*/
    comment('should add half the comment',
            {'#parent': [idFound, idNotFound], 'comment': 'a'})
        .expectStatus(207)
        .after(function (error, response, body) {
            remove('', body[0]._id);
        }).toss();
    comment('should add a comment', {'#parent': idFound, 'comment': 'a'})
        .expectStatus(201)
        .after(function (error, response, body) {
            remove('', body[0]._id);
        }).toss();
    /*comment('should add a comment', [{'#parent': idFound, 'comment': 'a'}])
        .expectStatus(201)
        .after(function (error, response, body) {
            remove('', body[0]._id);
        }).toss();*/
    comment('should add a comment', {'#parent': [idFound], 'comment': 'a'})
        .expectStatus(201)
        .after(function (error, response, body) {
            remove('', body[0]._id);
        }).toss();
    // */

    /*
     * Graph tests
     */
    graph_get('should throw an error (missing id)', '')
        .expectStatus(400).toss();
    graph('should throw an error (missing id)', [])
        .expectStatus(400).toss();
    graph('should throw an error (invalid id)', [{a: null}])
        .expectStatus(400).toss();

    graph_get('should throw an error (id not found)', idNotFound)
        .expectStatus(404).toss();
    /*graph('should throw an error (id not found)', idNotFound)
        .expectStatus(404).toss();*/

    graph_get('should throw an error (id not found)', idCustom)
        .expectStatus(404).toss();

    graph_get('should get a valid node', idFound)
        .expectStatus(200).toss();

    graph_get('should get a valid node with custom id', idCustomEncoded)
        .expectStatus(200).toss();
    /*graph('should get a valid node with custom id', idCustom)
        .expectStatus(200).toss();*/

    graph_get('should get two nodes', [idFound, idCustomEncoded])
        .expectStatus(200)
        .expectJSONTypes({0: Object, 1: Object})
    .toss();
    graph('should get two nodes', [idFound, idCustom])
        .expectStatus(200)
        .expectJSONTypes({0: Object, 1: Object})
    .toss();
    // */

    /*
     * Lock and unlock tests
     */
    // Single lock
    lock('should throw an error (empty id)', '')
        .expectStatus(400).toss();
    lock('should throw an error (invalid id)', [{a: null}])
        .expectStatus(400).toss();

    /*lock('should throw an error (id not found)', idNotFound)
        .expectStatus(404).toss();

    lock('should lock a node', idFound)
        .expectStatus(200).toss();
    lock('should lock a custom-id node', idCustom)
        .expectStatus(200).toss();*/

    /*
    // To try with another username
    lock('should throw an error (already locked)', idCustom)
        .expectStatus(409).toss();
    unlock('should throw an error (locked by someone else)', idCustom)
        .expectStatus(409).toss();
    */

    // Single unlock
    unlock('should throw an error (empty id)', '')
        .expectStatus(400).toss();
    unlock('should throw an error (invalid id)', [{a: null}])
        .expectStatus(400).toss();

    /*unlock('should throw an error (id not found)', idNotFound)
        .expectStatus(404).toss();

    unlock('should unlock a node', idFound)
        .expectStatus(200).toss();
    unlock('should unlock a custom-id node', idCustom)
        .expectStatus(200).toss();*/

    // Multiple operations
	/*
    lock('should lock two nodes', [idFound, idCustom])
        .expectStatus(200).toss();
    unlock('should unlock two nodes', [idFound, idCustom])
        .expectStatus(200).toss();
		*/
    // */

    /*
     * Version tests
     */
	 /*
    version('should throw an error (empty id)', '', '')
        .expectStatus(400).toss();

    version('should throw an error (missing file key)', idFound, {})
        .expectStatus(400).toss();

    version('should throw an error (id not found)', idNotFound, {file: '/'})
        .expectStatus(404).toss();

    version('should create a version', idFound, {file: '/path/abc.ext'})
        .expectStatus(201).after(function (error, response, body) {
            // Now delete the two versions
            search('should return one id', '#parent:' + body._id)
                .expectStatus(200).expectJSONTypes({0: String})
                .after(function (error, response, body) {
                    remove('should delete two nodes', [idFound, JSON.parse(body)[0]])
                        .expectStatus(200).toss();
                }).toss();
        }).toss();
		*/

    /*
     * Delete tests
     */
    remove('should throw an error (empty id)', '')
        .expectStatus(400).toss();
	    /*
	    // this is commented because we found an issue when we call the remove method with out an array
    remove('should throw an error (id not found)', idNotFound)
        .expectStatus(404).toss();

    remove('should delete a node', idFound)
        .expectStatus(200).toss();

    remove('should delete a custom-id node', idCustom)
        .expectStatus(200).toss();*/
    remove('', [idFound2, idCustom]).toss();

    /**
     * Tests for methods Create and Delete with multiple parameters
     */
    create('should create two nodes in the database', [
            {key: 'value', num: 3},
            {_id: idCustom, key: 'value', num: 3}
         ])
        .expectStatus(201)
        //.expectJSON('*', {
            //key: 'value',
            //num: 3
        //})
        .after(function (error, response, body) {

        var res = response.body,
        idFound = res[0];

        remove('should delete two nodes', [idFound, idCustom])
            .expectStatus(200).toss();

        create('should create half the nodes (duplicate)', [
                {_id: idCustom, key: 'value'},
                {_id: idCustom}])
            .expectStatus(207)
            .after(function (error, response, body) {

            remove('should delete half of the nodes', [idCustom, idNotFound])
                .expectStatus(207).toss();

        }).toss();

    }).toss();
}).toss();
}).toss();

