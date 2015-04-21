var request = require('supertest');
var api     = require('../index.js');
var host    = process.env.API_TEST_HOST || api;

request = request(host);
/**
 * Its important to set up the vars according your data in the database, particulary in the vars with valid data 
**/

describe('Damas-core - Server NodeJs [API]', function() {
	/**
	* Tests for method create
	**/
	describe(' CRUD - Create', function() {
		var dataOk = {
			"node" : {
				"type" : "node Test", 
				"link" : {
					"type_link" :"normal", 
					"src_id": 1031241,
					"tgt_id": 546992 
				}
			}
		};
		var jsonEmpty  = {};
		var stringTest = 'Foo';
		var jsonNull   = null;
	
		it('should to throw an error (JSON Empty)', function(done) {
			request
				.post('/')
				.set('Accept', 'application/json')
				.send(jsonEmpty)
				.expect(400)
				.end(done)
		});
		it('should to throw an error (JSON expected, string found )', function(done) {
			request
				.post('/')
				.set('Accept', 'application/json')
				.send(stringTest)
				.expect(409)
				.end(done)
		});
		it('should to throw an error (JSON expected, null found )', function(done) {
			request
				.post('/')
				.set('Accept', 'application/json')
				.send(jsonNull)
				.expect(400)
				.end(done)
		});
		it('should create an object in the database', function(done) {
			request
				.post('/')
				.set('Accept', 'application/json')
				.send(dataOk)
				.expect('Content-Type', /application\/json/)
				.expect(201)
				.end(done);
		});
	}); 

	/**
	* Tests for method Read
	**/
	describe(' CRUD - Read', function() {
		var notExistId = '552fdc00d0bc266248e1eb08';
		var validId    = '5535b33d6b4e27a35fc7a54c';
		var badId      = '5535b3';

		it('should throw an error 404 (id valid but not found in db)', function(done) {
			request
				.get('/' + notExistId)
				.set('Accept', 'application/json')
				.expect(404)
				.end(done)
		});
		it('should get a document from db (id exists)', function(done) {
			request
				.get('/' + validId)
				.set('Accept', 'application/json')
				.expect('Content-Type', /application\/json/)
				.expect(200)
				.end(done)
				// .end( function(err, res){
				// 	var body = res.body;
				// 	console.log(body);
				// 	done(err);
				// })
		});
		it('should throw an error 404 (id not valid)', function(done) {
			request
				.get('/' + badId)
				.set('Accept', 'application/json')
				.expect(404)
				.end(done)
		});
		it('should throw an error 400 (id empty - without params) - Bad request', function(done) {
			request
				.get('/')
				.set('Accept', 'application/json')
				.expect(400)
				.end(done)
		});
	});
	/**
	* Tests for method update
	**/
	describe(' CRUD - Update', function() {
		var idEmpty    = "";
		var validId    = '5535b33d6b4e27a35fc7a54c';
		var invalidId    = '111111111111111111111111';
		var validData = {
			"nodeUpdated" : {
				"type" : "node Test updated", 
				"link" : {
					"type_link" :"normalUpdated", 
					"src_id": 7,
					"tgt_id": 14 
				}
			}
		};
		var invalidData = {};
		var nullData = null;

		it('should throw an error 400 (id empty)', function(done) {
			request
				.put('/' + idEmpty)
				.set('Accept', 'application/json')
				.expect(400)
				.end(done)
		});
		it('should throw an error 400 (id - not valid)', function(done) {
			request
				.put('/' + invalidId)
				.set('Accept', 'application/json')
				.expect(400)
				.end(done)
		});
		it('should throw an error 400 (format data invalid) with valid id', function(done) {
			request
				.put('/' + validId)
				.set('Accept', 'application/json')
				.send(invalidData)
				.expect(400)
				.end(done)
		});
		it('should throw an error 400 (format data invalid) with invalid id', function(done) {
			request
				.put('/' + invalidId)
				.set('Accept', 'application/json')
				.send(invalidData)
				.expect(400)
				.end(done)
		});
		it('should throw an error 400 (null data) with valid id', function(done) {
			request
				.put('/' + validId)
				.set('Accept', 'application/json')
				.send(nullData)
				.expect(400)
				.end(done)
		});
		it('should throw an error 400 (null data) with invalid id', function(done) {
			request
				.put('/' + invalidId)
				.set('Accept', 'application/json')
				.send(nullData)
				.expect(400)
				.end(done)
		});
		it('should update a document - data valid, id valid', function(done) {
			request
				.put('/' + validId)
				.set('Accept', 'application/json')
				.send(validData)
				.expect('Content-Type', /application\/json/)
				.expect(200)
				.end(done)
		});
	});
	/**
	* Tests for method delete
	**/
	describe(' CRUD - Delete', function() {
		var validId      = '5535b4c700d38aaf602c1e58';
		var invalidId    = '111111111111111111111111';
		var idEmpty      = "";
		var idValidButNotInDb = "5527f052a23a84b74a548792";

		it('should throw an error 400 (id - not valid)', function(done) {
			request
				.delete('/' + invalidId)
				.set('Accept', 'application/json')
				.expect(400)
				.end(done)
		});
		it('should throw an error 400 (id empty)', function(done) {
			request
				.delete('/' + idEmpty)
				.set('Accept', 'application/json')
				.expect(400)
				.end(done)
		});
		it('should throw an error 409 (id valid but not found in the DB)', function(done) {
			request
				.delete('/' + idValidButNotInDb)
				.set('Accept', 'application/json')
				.expect(409)
				.end(done)
		});
		it('should delete a document with an id valid', function(done) {
			request
				.delete('/' + validId)
				.set('Accept', 'application/json')
				.expect(200)
				.end(done)
		});
	});
});