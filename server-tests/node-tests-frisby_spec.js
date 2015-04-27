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
	// Protocol to use "http" or "https" in tests- (By default "http")
	// When "https" is used, the port 443 is enabled
	// When "http" is used, the port 8090 is enabled
	// Please note: The protocol is written in lowercase
	var protocol = "http";
	var port;
//END: ----------------SETTINGS---------------

if(protocol != "http" && protocol != "https")
{
	console.log("You must choose a protocol for testing 'http' or 'https'");
}
else
{
	if(protocol==="http")
	{
		port = conf.http.port;
	}
	else
	{
		port = conf.https.port;
	}

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
	json = conf.expects.contentType.json;
	//END: ----------------VARIABLES--------------



	/**
	 * Tests for method Create
	 *
	 * Example - Post method structure : "http://localhost(1):8090(2)/home(3){"id": 123}(4), {json:true}(5)"
	 * (1) host
	 * (2) port
	 * (3) path
	 * (4) send data to the server
	 * (5) enable or disable send json 
	 */
	frisby.create('CREATE - should to throw an error (JSON Empty)')
		.post(protocol + '://' + host + ':' + port + path, jsonEmpty, {json : true})
		.expectStatus(400)
	.toss();

	frisby.create('CREATE - should to throw an error (JSON expected, string found)')
		.post(protocol + '://' + host + ':' + port + path, textString, {json : true})
		.expectStatus(400)
	.toss();

	frisby.create('should to throw an error (JSON expected, null found )')
		.post(protocol + '://' + host + ':' + port + path)
		.expectStatus(400)
	.toss();

	frisby.create('CREATE - should create an object in the database')
		.post(protocol + '://' + host + ':' + port + path, dataOk, {json : true})
		.expectStatus(201)
		.expectHeaderContains('Content-Type', json)
	.toss();
	
	/**
	 * Tests for method Read
	 */
	frisby.create('READ - should throw an error 409 (id valid but not found in db) - ID through URL')
		.get(protocol + '://' + host + ':' + port + path + idNotFoundInDb)
		.expectStatus(409)
	.toss();

	frisby.create('READ - Get a record valid')
		.get(protocol + '://' + host + ':' + port + path + idFoundInDb)
		.expectStatus(200)
		.expectHeaderContains('Content-Type', json)
	.toss();

	frisby.create('READ - should throw an error 404 (id not valid) - ID through URL')
		.get(protocol +'://' + host + ':' + port + path + idInvalid)
		.expectStatus(404)
	.toss();

	frisby.create('READ - should throw an error 400 (id empty - without params) - Bad request')
		.get(protocol + '://' + host + ':' + port + path)
		.expectStatus(400)
	.toss();

	/**
	 * Tests for method Update
	 */
	frisby.create('UPDATE - should throw an error 400 (id empty)')
		.put(protocol + '://' + host + ':' + port + path + idEmpty)
		.expectStatus(400)
	.toss();

	frisby.create('UPDATE - should throw an error 400 (id - not valid)')
		.put(protocol + '://' + host + ':' + port + path + idInvalid)
		.expectStatus(400)
	.toss();

	frisby.create('UPDATE - should throw an error 400 (format data invalid) with valid id')
		.put(protocol + '://' + host + ':' + port + path +  idFoundInDb, jsonEmpty, {json : true})
		.expectStatus(400)
	.toss();

	frisby.create('UPDATE - should throw an error 400 (format data invalid) with invalid id')
		.put(protocol + '://' + host + ':' + port + path + idEmpty, jsonEmpty , {json : true})
		.expectStatus(400)
	.toss();

	frisby.create('UPDATE - should throw an error 400 (null data) with valid id')
		.put(protocol + '://' + host + ':' + port + path + idFoundInDb)
		.expectStatus(400)
	.toss();

	frisby.create('UPDATE - should update a document - data valid, id valid')
		.put(protocol + '://' + host + ':' + port + path + idFoundInDb, dataUpdated , {json : true})
		.expectStatus(200)
	.toss();
			
	/**
	 * Tests for method delete
	 */
	frisby.create('DELETE - should throw an error 400 (id - not valid)')
		.delete(protocol + '://' + host + ':' + port + path + idInvalid)
		.expectStatus(400)
	.toss();

	frisby.create('DELETE - should throw an error 400 (id empty)')
		.delete(protocol + '://' + host + ':' + port + path + idEmpty)
		.expectStatus(400)
	.toss();

	frisby.create('DELETE - should throw an error 409 (id valid but not found in the DB)')
		.delete(protocol + '://' + host + ':' + port + path + idNotFoundInDb)
		.expectStatus(409)
	.toss();

	/*frisby.create('DELETE - should delete a document with an id valid')
		.delete(protocol + '://' + host + ':' + port + path + idFoundInDb)
		.expectStatus(200)
	.toss();*/
}


