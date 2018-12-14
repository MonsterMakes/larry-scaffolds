'use strict';
const chai = require('chai');
const should = chai.should(); // eslint-disable-line 
const expect = chai.expect; // eslint-disable-line 
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const ApiServer = require('../../../src/ApiServer');
const TEST_NAME = 'Test ApiServer and ResponseHelper';

let apiServer = undefined;
describe(TEST_NAME, () => {
	before(()=>{
		apiServer = new ApiServer({
			services: [
			],
			serviceLocations: [
				'./src/**/*.service.js',
				__dirname + '/Test.service.js'
			]
		});
		return apiServer.start()
			.then(()=>{
				
			});
	});
	it('should Pass health-check',function () {
		this.timeout(300000);
		//make /health-check request
		let appRequester = chai.request(apiServer._expressApp);
		return appRequester.get('/health-check')
			.then((response)=>{
				response.should.exist;
				expect(response).to.have.status(200);
			});
	});
	it('should pass validation when the response is invalid',function () {
		//The validation library is not designed to validate the responses, we should still be providing the structure for documentation purposes.
		this.timeout(300000);
		let appRequester = chai.request(apiServer._expressApp);
		return appRequester.get('/test-500-response')
			.then((response)=>{
				response.should.exist;
				expect(response).to.have.status(500);
			});
	});
	it('should not validate bad params',function () {
		this.timeout(300000);
		let appRequester = chai.request(apiServer._expressApp);
		return appRequester.get('/test-query')
			.then((response)=>{
				response.should.exist;
				expect(response).to.be.json;
				expect(response).to.have.status(400);
				response.body.should.exist;
				response.body.errorCode.should.be.eql('ValidationError');
				response.body.errorMsg.should.be.eql('Error while validating request: request.query should have required property \'id\'');
				response.body.validationErrors.should.be.eql([{'keyword':'required','dataPath':'.query','schemaPath':'#/properties/query/required','params':{'missingProperty':'id'},'message':'should have required property \'id\''}]);
			});
	});
	it('should respond with 400 on thrown error',function () {
		this.timeout(300000);
		let appRequester = chai.request(apiServer._expressApp);
		return appRequester.get('/test-throw')
			.then((response)=>{
				response.should.exist;
				expect(response).to.be.json;
				expect(response).to.have.status(400);
				response.body.errorCode.should.be.eql('ThrownError');
				response.body.errorMsg.should.be.eql('Another way to send a 400');
			});
	});
	after(()=>{
		return apiServer.shutdown();
	});
});