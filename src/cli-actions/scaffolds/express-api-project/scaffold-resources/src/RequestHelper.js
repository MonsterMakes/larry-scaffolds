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
		let result = undefined;
		let authHeader = this.getAuthorization();
		const CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/;
		const USER_PASS_REGEXP = /^([^:]*):(.*)$/;
		// parse header
		let match = CREDENTIALS_REGEXP.exec(authHeader);

		if (match) {
			// decode user pass
			let decoded = Buffer.from(match[1], 'base64').toString();
			let userPass = USER_PASS_REGEXP.exec(decoded);

			if (userPass) {
				result = {
					username: userPass[1],
					password: userPass[2]
				};
			}
		}
		return result;
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