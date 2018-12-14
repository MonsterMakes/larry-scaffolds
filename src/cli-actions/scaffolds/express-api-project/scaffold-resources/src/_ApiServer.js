'use strict';

const _ = require('lodash');
const http = require('http');
const Express =  require('express');
const cookieParser =  require('cookie-parser');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const cors = require('cors');
const glob = require('glob');
const ResponseHelper = require('./ResponseHelper');
const RequestHelper = require('./RequestHelper');
const pathUtils = require('path');
const swaggerUi = require('swagger-ui-express');
const { OpenApiValidator } = require('express-openapi-validate');

const STATUS = {
	INITIALIZING: 'INITIALIZING',
	UNKNOWN:'UNKNOWN',
	STARTING:'STARTING',
	LISTENING: 'LISTENING',
	CONNECTED:'CONNECTED',
	ERRORD:'ERRORD',
	SHUTDOWN:'SHUTDOWN',
};
Object.freeze(STATUS);

/**
 * @typedef ApiServerOptions
 * @type {object}
 * @property {array} services - An array of npm package names used to load Services.
 * @property {array} serviceLocations - An array of glob patterns used to lookup Services.
 */
class ApiServer{
	/**
	 * 
	 * @param {ApiServerOptions} options - Optional settings for this ApiServer
	 */
	constructor(options={}){
		this._setStatus(this.STATUS_STATES.INITIALIZING);

		this._expressApp = Express();

		this._options = options;

		this._loadedServices = {};

		this._initializeExpressApp();
		
		this._server = new http.createServer(this._expressApp);	
	}
	/*************************************************************************************/
	/* START PRIVATE METHODS */
	/*************************************************************************************/
	_initializeExpressApp(){
		//Need to change allowed origins as per our env setup
		this._expressApp.use(cors({ origin: '*' }));
		this._expressApp.use(Express.json());
		this._expressApp.use(Express.urlencoded({ extended: false }));
		this._expressApp.use(cookieParser());
		this._expressApp.use(bodyParser.json());
		this._expressApp.use(bodyParser.urlencoded({ extended: false }));
		
		//Setup routes
		this._setupRoutes();

		//Setup Error Handlers
		this._setupErrorHandlers();
	}
	_setupOpenApiDefinition(router,apiLocations){
		let pkg = require('../package.json');
		const options = {
			swaggerDefinition: {
				openapi: '3.0.0',
				info: {
					title: pkg.name,
					version: pkg.versions,
					description: pkg.description,
					termsOfService: 'http://{{apiWebsite}}/terms',
					contact: {
						name: 'Support',
						url: 'http://www.{{apiWebsite}}/support',
						email: 'support@{{apiWebsite}}'
					},
					license: {
						name: 'License',
						url: 'http://www.{{apiWebsite}}/license'
					}
				},
				basePath: '/'
			},
			apis: apiLocations
		};
		
		// Initialize swagger-jsdoc -> returns validated swagger spec in json format
		this._openApiDefinition = swaggerJsDoc(options);

		//Setup OpenAPI Validator 
		this._validator = new OpenApiValidator(this._openApiDefinition);
		
		// Serve OpenAPI 3.0 Definition
		this._expressApp.get('/api-docs.json', (req, res) => {
			let responseHelper = new ResponseHelper(res);
			responseHelper.send(this._openApiDefinition);
		});

		//Render the Api Documentation
		router.use('/api-docs',swaggerUi.serve);
		router.use('/api-docs',swaggerUi.setup(this._openApiDefinition,{
			explorer : true,
			swaggerOptions: {
				filter: true
			}
		}));
	}
	_setupRoutes(){
		this._router = Express.Router();

		let serviceRelativeFromCwdFilePaths = [];
		//Load specific services by full path or npm package name
		if(this._options.services){
			this._options.services.forEach(servicePath => {
				//get the fully resolved path to the service for use by swagger-jsdoc
				let pathToFile = require.resolve(servicePath);
				//add the relative from CWD path
				serviceRelativeFromCwdFilePaths.push(pathUtils.relative(process.cwd(),pathToFile));
			});
		}
		//Load services by Glob patterns
		let serviceLocations = [ __dirname+'/**/*.service.js' ];
		if(this._options.serviceLocations){
			serviceLocations = this._options.serviceLocations;
		}
		
		//find all the services referenced in this._serviceLocations 
		serviceLocations.forEach(globPattern => {
			let found = glob.sync (globPattern, {});
			found.forEach(foundPath => {
				//add the relative from CWD path
				serviceRelativeFromCwdFilePaths.push(pathUtils.relative(process.cwd(),foundPath));
			});
		});

		//Setup the OpenAPI Specification
		this._setupOpenApiDefinition(this._router,serviceRelativeFromCwdFilePaths);
		
		//Load each of the Services
		serviceRelativeFromCwdFilePaths.forEach(servicePath => {
			try{
				let relativeFromHere = './' + pathUtils.relative(__dirname,pathUtils.join(process.cwd(),servicePath));
				let Service = require(relativeFromHere);
				let serviceInstance = new Service({
					apiServer: this
				});
				let serviceName = serviceInstance.constructor.name;

				//this service has elected to setup its own routes
				if(_.isFunction(serviceInstance._setupRoutes)){
					serviceInstance._setupRoutes(this._router);
				}
				
				//keep a map of all the loaded services
				this._loadedServices[serviceName] = serviceInstance;
			}
			catch(e){
				throw e;
			}
		});

		//loop through all paths in the OpenAPI Definition and create routes for each service method
		Object.getOwnPropertyNames(this._openApiDefinition.paths).forEach((path)=>{
			let pathDefinition = this._openApiDefinition.paths[path];
			let route = this._router.route(path);
			//loop through each method associated with a specific path
			Object.getOwnPropertyNames(pathDefinition).forEach((method)=>{
				let methodDefinition = pathDefinition[method];
				if(!methodDefinition.hasOwnProperty('serviceMethod')){
					throw new Error(`${method.toUpperCase()} ${path} was defined in the Open API Definition but did not specify a serviceMethod property under the method definition.`);
				}
				else{
					//lookup the serviceMethod in the loaded services
					if(_.has(this,`_loadedServices.${methodDefinition.serviceMethod}`)){
						throw new Error(`${method.toUpperCase()} ${path} was defined in the Open API Definition but we could not find a loaded serviceMethod using serviceMethod property ${methodDefinition.serviceMethod}.`);
					}
					else{
						let serviceMethodParts = methodDefinition.serviceMethod.split('.');
						if(serviceMethodParts.length !== 2){
							throw new Error(`${method.toUpperCase()} ${path} was defined in the Open API Definition but the serviceMethod property is not of the format <ServiceName>.<ServiceMethod> (${methodDefinition.serviceMethod}).`);
						}
						else{
							let serviceName = serviceMethodParts[0];
							let serviceMethod = serviceMethodParts[1];
							//load the route
							route[method](
								//validation middleware
								this._validator.validate(method,path),
								//Handle Request via the registered service
								(req, res, next)=>{
									try{
										let requestHelper = new RequestHelper(req);
										let responseHelper = new ResponseHelper(res);
										//find method from path name
										Promise.resolve()
											.then(()=>{
												return this._loadedServices[serviceName][serviceMethod](requestHelper,responseHelper);
											})
											.then((response)=>{
												//if the method returned a value
												if(response){
													responseHelper.ok(response);
												}
											})
											.catch(serviceMethodEncounteredErr =>{
												responseHelper.badRequest(serviceMethodEncounteredErr);
											});
									}
									catch(e){
										next(e);
									}
								}
							);
						}
					}
				}
			});
		});

		//wire up the router
		this._expressApp.use('/',this._router);
	}
	_setupErrorHandlers(){
		// catch 404
		this._expressApp.use((req, res, next)=> {//eslint-disable-line
			let responseHelper = new ResponseHelper(res);
			responseHelper.notFound();
		});

		// error handler
		this._expressApp.use((err, req, res, next)=>{//eslint-disable-line
			//delegate to the default Express error handler
			if (res.headersSent) {
				return next(err);
			}
			else {
				let requestHelper = new RequestHelper(req);
				let responseHelper = new ResponseHelper(res);
				let errorName = _.get(err,'constructor.name',undefined);
				switch (errorName){
				//Errors as reported by express-openapi-validate middleware
				case 'ValidationError':
					responseHelper.respondWithErrorDetails('ValidationError', err.message, {validationErrors: err.data, request: requestHelper, response: responseHelper},400);
					break;
				//Something went wrong that we did NOT expect send generic error
				default:
					//Providing requestHelper & responseHelper as additional 
					//props here will properly marshal more readable information for the client.
					responseHelper.respondWithError(err,{request: requestHelper, response: responseHelper},500);
					break;
				}
			}
		});
	}
	_setStatus(status){
		if(this.STATUS_STATES.hasOwnProperty(status)){      
			this._status = status;
		}
		else{
			throw new Error(`Unknown Status, cannot set the status of the Websocket Server ({{serverName}}) to ${status}`);
		}
	}
	/*************************************************************************************/
	/* START PUBLIC API METHODS */
	/*************************************************************************************/
	get STATUS_STATES(){
		return STATUS;
	}
	getStatus(){
		return this._status;
	}
	start(){
		return Promise.resolve()
			//start listening on port 8080 and register all the common listeners
			.then(()=>{
				return new Promise((resolve,reject)=>{
					this._server.listen(8080,(err)=>{
						if(err){
							this.shutdown();
							reject(err);
						}
						else{
							resolve();
						}
					});
					this._server.on('error', this._onError = this._onError.bind(this));
					this._server.on('listening', this._onListening = this._onListening.bind(this));
				});
			});
	}
	shutdown(){
		return Promise.resolve()
			.then(()=>{
				this._server.removeListener('error', this._onError);
				this._server.removeListener('listening', this._onListening);
				return new Promise((resolve,reject)=>{
					this._server.close((err)=>{
						if(err){
							reject(err);
						}
						else{
							resolve();
						}
					});
				});
			});
	}
	/*************************************************************************************/
	/* END PUBLIC API METHODS */
	/* START HTTP SERVER HANDLER METHODS */
	/*************************************************************************************/
	_onError(error){
		if (error && error.syscall === 'listen') {
			switch (error.code) {
			case 'EACCES':
				console.error(`Api Server ({{serverName}}) on Address: ${address} and port : ${address.port} requires elevated privileges.`);
				process.exit(1);
				break;
			case 'EADDRINUSE':
				console.error(`Api Server ({{serverName}}) on Address: ${address} and port : ${address.port} cannot start port is already in use.`);
				process.exit(1);
				break;
			default:
				throw error;
			}
		}
		else{
			throw error; //this will be caught by the uncaughtException handler see ../index.js
		}
	}
	_onListening(){
		const addressInfo = this._server.address();
		this._setStatus(this.STATUS_STATES.LISTENING);
		console.info(`Api Server (dude-api) listening on Address: ${addressInfo.address} and port : ${addressInfo.port}`);
	}
	/*************************************************************************************/
	/* END HTTP SERVER HANDLER METHODS */
	/*************************************************************************************/
}
module.exports = ApiServer;