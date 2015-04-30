/**
* Assertion and testing utilities
*/
var chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

	chai.use(chaiAsPromised);

	GLOBAL.AssertionError = chai.AssertionError;
	GLOBAL.expect = chai.expect;