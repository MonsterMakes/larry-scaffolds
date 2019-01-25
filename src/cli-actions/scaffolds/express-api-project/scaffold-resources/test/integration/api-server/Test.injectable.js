'use strict';
const BaseInjectable = require('../../../src/injectables/BaseInjectable');

class TestInjectable extends BaseInjectable{
	constructor(context){
		super(context);
	}
	/*************************************************************************************/
	/* START PRIVATE METHODS */
	/*************************************************************************************/

	/*************************************************************************************/
	/* END PRIVATE METHODS */
	/* START PUBLIC API METHODS */
	/*************************************************************************************/
	sayHi(){
		console.log('hi');
	}
	_handleStart(){
		//return Promise.resolve();
		//return Promise.reject(new Error('badthings'));
	}
	_handleShutdown(){
		return Promise.resolve();
		//return Promise.reject(new Error('badthings'));
	}
	/*************************************************************************************/
	/* END PUBLIC API METHODS */
	/*************************************************************************************/
}
TestInjectable.$context = {
	'ApiServer': true
};
module.exports = TestInjectable;