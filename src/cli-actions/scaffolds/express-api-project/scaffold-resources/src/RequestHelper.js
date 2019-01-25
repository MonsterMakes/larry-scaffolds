'use strict';
/**
 * This is a collection of properties and utilities to help API developers work with API requests, while keeping things consitent.
 */
class RequestHelper {
	constructor(req){
		this._request = req;
		//Unfortunately the Express framework mutates their request object so this member cannot be frozen.
		//Object.freeze(this._response);
	}/*********************************************************************/
	/* START IMUTTABLE PROPERTIES & GETTERS */
	/*********************************************************************/
	get rawRequest(){
		return this.getRawRequest();
	}
	getRawRequest(){
		return this._request;
	}
	get path(){
		return this.getPath();
	}
	getPath(){
		return this._request.path;
	}
	get params(){
		return this.getParams();
	}
	getParams(){
		return this._request.params;
	}
	get payload(){
		return this.getPayload();
	}
	getPayload(){
		return this._request.body;
	}
	get cookies(){
		return this.getCookies();
	}
	getCookies(){
		return this._request.cookies;
	}
	get signedCookies(){
		return this.getSignedCookies();
	}
	getSignedCookies(){
		return this._request.signedCookies;
	}
	get qeryParams(){
		return this.getQueryParams();
	}
	getQueryParams(){
		return this._request.getQueryParams;
	}
	get subDomains(){
		return this.getSubDomains();
	}
	getSubDomains(){
		return this._request.subdomains;
	}
	getHeaders(){
		return this._request.headers;
	}
	getHeader(headerName){
		return this._request.get(headerName);
	}
	get authorization(){
		return this.getAuthorization();
	}
	getAuthorization(){
		return this.getHeader('Authorization');
	}
	bearerToken(){
		return this.getBearerToken();
	}
	getBearerToken(){
		let result = undefined;
		let authHeader = this.getAuthorization();
		if(authHeader){
			let pieces = authHeader.split('Bearer ');
			if(pieces.length === 2){
				result = pieces[1];			
			}
		}
		return result;
	}
	basicAuth(){
		return this.getBasicAuth();
	}
	getBasicAuth(){
		// parse login and password from headers
		let authHeader = this.getAuthorization();
		const b64auth = (authHeader || '').split(' ')[1] || '';
		const [username, password] = Buffer.from(b64auth, 'base64').toString().split(':');

		if (username && password){
			return {
				username: username,
				password: password
			};
		}
		else{
			return undefined;
		}
	}
	/*********************************************************************/
	/* END IMUTTABLE PROPERTIES & GETTERS */
	/* START PUBLIC METHODS */
	/*********************************************************************/
	/*********************************************************************/
	/* END PUBLIC METHODS */
	/*********************************************************************/
	toJSON(){
		return {
			params: this.getParams(),
			payload: this.getPayload(),
			cookies: this.getCookies(),
			signedCookies: this.getSignedCookies(),
			qeryParams: this.getQueryParams(),
			subDomains: this.getSubDomains(),
			authorization: this.getAuthorization(),
			bearerToken: this.getBearerToken(),
			basicAuth: this.getBasicAuth(),
			headers: this.getHeaders()
		};
	}
}

module.exports = RequestHelper;