/**
 * REST API Testing using Frisby.js - Assigning values to variables in conf.json file
 * Remember: You must configure the parameters and variables in conf-tests-frisby.
 * @requires module:frisby
 * @requires ./conf.json
 */
 var frisby = require('frisby'),
conf = require('./conf-tests-frisby');

//To test with https
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


//START: --------------SETTINGS---------------
	//var url = "http://damas-server.com/crud";
	var url = "http://localhost:8090/api";
//END: ----------------SETTINGS---------------

//START: --------------VARIABLES--------------
var host = conf.host,
path = conf.path,
idNotFoundInDb = conf.args.idNotFoundinDb,
idFoundInDb = conf.args.idFoundInDb,
idEmpty = conf.args.idEmpty,
idInvalid = conf.args.idInvalid,
textString = conf.args.string,
vnull = conf.args.vnull,
jsonEmpty = conf.args.jsonEmpty,
dataOk = conf.args.dataOk,
dataInvalid = conf.args.dataInvalid,
dataUpdated = conf.args.dataUpdated,
tjson = conf.expects.contentType.json;
//END: ----------------VARIABLES--------------


	frisby.create('/api/signin')
		.post(url+"/signIn", {"username": "demo", "password": "demo"} )
		.expectStatus(200)
		.after(function (error, response, body) {
			token = body.token;
		}).toss();


	/**
	 * Tests for method Create
	 */
	frisby.create('CREATE - should create an object in the database')
		.post(url, {"key" : "value"})
		.expectStatus(200)
		.expectHeaderContains('Content-Type', tjson)
		.after(function (error, response, body) {
		
		var res = JSON.parse(response.body)
		idFoundInDb = res._id || res.id;

		frisby.create('CREATE - should to throw an error (JSON Empty)')
			.post(url, jsonEmpty)
			.expectStatus(400)
		.toss();

		frisby.create('CREATE - should to throw an error (JSON expected, string found)')
			.post(url, textString)
			.expectStatus(400)
		.toss();

		frisby.create('CREATE - should to throw an error (JSON expected, null found )')
			.post(url)
			.expectStatus(400)
		.toss();

		/**
 		 * Tests for method Read
 		 */
		frisby.create('READ - should throw an error 404 (id- not found in db)')
			.get(url + "/" + idNotFoundinDb)
			.expectStatus(404)
		.toss();

		frisby.create('READ - Get a record valid')
			.get(url + "/" + idFoundInDb)
			.expectStatus(200)
			.expectHeaderContains('Content-Type', tjson)
		.toss();

		frisby.create('READ - should throw an error 404 (id not valid) ')
			.get(url + "/" + idInvalid)
			.expectStatus(404)
		.toss();

		frisby.create('READ - should throw an error 400 (id empty) - Bad request')
			.get(url)
			.expectStatus(400)
		.toss();

		/**
		 * Tests for method Update
		 */
		frisby.create('UPDATE - should throw an error 400 (id empty, no data send)')
			.put(url , {"id" : ""} )
			.expectStatus(400)
		.toss();

		frisby.create('UPDATE - should throw an error 400 (id - not valid- Bad Format, no data send)')
			.put(url , {"id": idInvalid} )
			.expectStatus(400)
		.toss();

		frisby.create('UPDATE - should throw an error 400 (format data invalid) with valid id')
			.put(url, {"id" : idFoundInDb, "keys" : "{}"} )
			.expectStatus(400)
		.toss();

		frisby.create('UPDATE - should throw an error 400 (format data invalid) with invalid id')
			.put(url, {"id" : idNotFoundinDb, "keys" : "{}" } )
			.expectStatus(400)
		.toss();

		frisby.create('UPDATE - should throw an error 400 (null data) with valid id')
			.put(url, {"id" : idFoundInDb })
			.expectStatus(400)
		.toss();

		frisby.create('UPDATE - should update a document - data valid, id valid')
			.put(url, { "id": idFoundInDb, "keys" : {"type_link":"typeTestUpdated 15"} } )
			.expectStatus(200)
		.toss();
				
		/**
		 * Tests for method delete
		 */
		frisby.create('DELETE - should throw an error 400 (id - not valid)')
			.delete(url, {"id": idInvalid} )
			.expectStatus(409)
			//.inspectBody()
		.toss();

		frisby.create('DELETE - should throw an error 400 (id empty)')
			.delete(url, {"id" : ""} )
			.expectStatus(400)
			//.inspectBody()
		.toss();

		frisby.create('DELETE - should throw an error 400 (id null)')
			.delete(url)
			.expectStatus(400)
		.toss();

		frisby.create('DELETE - should throw an error 404 (id valid but not found in the DB)')
			.delete(url, {"id" : idNotFoundinDb} )
			.expectStatus(409)
		.toss();
		/*
		frisby.create('DELETE - should delete a document with an id valid')
			.delete(url, {"id" : idFoundInDb })
			.expectStatus(200)
		.toss();*/
	}).toss();
