var request = require('supertest');
var api     = require('../index.js');
var host    = process.env.API_TEST_HOST || api;

request = request(host);
/*
 * Its important to set up the vars according your data in the database, particulary in the vars with valid data
 */

describe('Damas-core - Server NodeJs [API]', function() {

    /*
     * Variables declaration
     */
    var notExistId = '552fdc00d0bc266248e1eb08';
    var idEmpty = '';
    var nullData = null;
    var validId = '5537a27077d0099b2f886a79';
    var customId = '/file/;.*?<>#%';
    var customIdEncoded = '%2ffile%2f;.*%3f<>%23%25'

    /*
     * Tests for method create
     */
    describe('CRUD - Create', function() {
        var dataOk = {
            'node' : {
                'type' : 'node Test',
                'link' : {
                    'type_link' :'normal',
                    'src_id': 1031241,
                    'tgt_id': 546992
                }
            }
        };
        var dataCustomId = {
            '_id': customId,
            'key': 'value',
            'otherkey': true,
            'lastkey': {'keyinobject': 1234}
        };
        var stringTest = 'Foo';

        it('should throw an error (JSON Empty)', function(done) {
            request
                .post('/api/')
                .set('Accept', 'application/json')
                .send(nullData)
                .expect(400)
                .end(done)
        });
        // 'Foo' is changed into {Foo:''} for no reason...
/*        it('should throw an error (JSON expected, string found )', function(done) {
            request
                .post('/api/create')
                .set('Accept', 'application/json')
                .send(stringTest)
                .expect(409)
                .end(done)
        });
*/        it('should throw an error (JSON expected, null found )', function(done) {
            request
                .post('/api/')
                .set('Accept', 'application/json')
                .send(nullData)
                .expect(400)
                .end(done)
        });
        it('should create an object in the database', function(done) {
            request
                .post('/api')
                .set('Accept', 'application/json')
                .send(dataOk)
                .expect('Content-Type', /application\/json/)
                .expect(201)
                .end(done);
        });
        it('should create an object in the database with custom id', function(done) {
            request
                .post('/api')
                .set('Accept', 'application/json')
                .send(dataCustomId)
                .expect('Content-Type', /application\/json/)
                .expect(201)
                .end(done);
        });
        it('should throw an error (id already exists)', function(done) {
            request
                .post('/api')
                .set('Accept', 'application/json')
                .send(dataCustomId)
                .expect(409)
                .end(done)
        });
    });

    /*
     * Tests for method Read
     */
    describe('CRUD - Read', function() {
        var notExistIdJSON = {'id': notExistId};
        var validIdJSON = {'id': validId};
        var customIdJSON = {'id': customId};

        it('should not throw an error 409 (id valid but not found in db) - ID through URL', function(done) {
            request
                .get('/api/' + notExistId)
                .set('Accept', 'application/json')
                .expect(200)
                .end(done)
        });
        it('should not throw an error 409 (id valid but not found in db) - ID through body', function(done) {
            request
                .post('/api/read')
                .set('Accept', 'application/json')
                .send(notExistIdJSON)
                .expect(200)
                .end(done)
        });
        it('should get a document from db (id exists) - ID through URL', function(done) {
            request
                .get('/api/' + validId)
                .set('Accept', 'application/json')
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .end(done)
        });
        it('should get a document from db (id exists) - ID  through body', function(done) {
            request
                .post('/api/read')
                .set('Accept', 'application/json')
                .send(validIdJSON)
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .end(done)
        });
        it('should throw an error 404 (custom id not valid) - ID through URL', function(done) {
            request
                .get('/api/' + customId)
                .set('Accept', 'application/json')
                .expect(404)
                .end(done)
        });
        it('should get a document from db (custom id exists) - ID through URL', function(done) {
            request
                .get('/api/' + customIdEncoded)
                .set('Accept', 'application/json')
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .end(done)
        });
        it('should get a document from db (custom id exists) - ID  through body', function(done) {
            request
                .post('/api/read')
                .set('Accept', 'application/json')
                .send(customIdJSON)
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .end(done)
        });
        it('should throw an error 400 (id empty - without params) - Bad request', function(done) {
            request
                .post('/api/read')
                .set('Accept', 'application/json')
                .expect(400)
                .end(done)
        });
    });
    /*
     * Tests for method update
     */
    describe('CRUD - Update', function() {
        var invalidId = '111111111111111111111111';
        var validData = {
            'nodeUpdated' : {
                'type' : 'node Test updated', 
                'link' : {
                    'type_link' :'normalUpdated', 
                    'src_id': 7,
                    'tgt_id': 14
                }
            }
        };
        var invalidData = {};

        it('should throw an error 400 (id - not valid)', function(done) {
            request
                .put('/api/' + invalidId)
                .set('Accept', 'application/json')
                .expect(400)
                .end(done)
        });
        it('should throw an error 400 (format data invalid) with valid id', function(done) {
            request
                .put('/api/' + validId)
                .set('Accept', 'application/json')
                .send(invalidData)
                .expect(400)
                .end(done)
        });
        it('should throw an error 400 (format data invalid) with invalid id', function(done) {
            request
                .put('/api/' + invalidId)
                .set('Accept', 'application/json')
                .send(invalidData)
                .expect(400)
                .end(done)
        });
        it('should throw an error 400 (null data) with valid id', function(done) {
            request
                .put('/api/' + validId)
                .set('Accept', 'application/json')
                .send(nullData)
                .expect(400)
                .end(done)
        });
        it('should throw an error 400 (null data) with invalid id', function(done) {
            request
                .put('/api/' + invalidId)
                .set('Accept', 'application/json')
                .send(nullData)
                .expect(400)
                .end(done)
        });
        it('should update a document - data valid, id valid', function(done) {
            request
                .put('/api/' + validId)
                .set('Accept', 'application/json')
                .send(validData)
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .end(done)
        });
        it('should throw an error 404 with invalid custom id', function(done) {
            request
                .put('/api/' + customId)
                .set('Accept', 'application/json')
                .send(validData)
                .expect(404)
                .end(done)
        });
        it('should update a document - data valid, custom id valid', function(done) {
            request
                .put('/api/' + customIdEncoded)
                .set('Accept', 'application/json')
                .send(validData)
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .end(done)
        });
    });
    /**
     * Tests for method delete
     */
    describe('CRUD - Delete', function() {
        /*it('should throw an error 400 (id - not valid)', function(done) {
            request
                .delete('/api/' + invalidId)
                .set('Accept', 'application/json')
                .expect(400)
                .end(done)
        });
        it('should throw an error 400 (id empty)', function(done) {
            request
                .delete('/api/' + idEmpty)
                .set('Accept', 'application/json')
                .expect(400)
                .end(done)
        });*/
        it('should throw an error 409 (id valid but not found in the DB)', function(done) {
            request
                .delete('/api/' + notExistId)
                .set('Accept', 'application/json')
                .expect(409)
                .end(done)
        });
        it('should delete a document with an id valid', function(done) {
            request
                .delete('/api/' + customIdEncoded)
                .set('Accept', 'application/json')
                .expect(200)
                .end(done)
        });
    });
});
