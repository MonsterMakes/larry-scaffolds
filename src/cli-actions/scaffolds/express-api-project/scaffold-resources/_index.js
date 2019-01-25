'use strict';
const namespace = '{{serverName}}.api';
const SINGLETON_KEY = Symbol.for(namespace);
const globalSpace = global;

const ApiServer = require('./src/ApiServer');
const globalSymbols = Object.getOwnPropertySymbols(globalSpace);
/*************************************************************************************/
/* START PROCESS UNHANDLED METHODS */
/*************************************************************************************/
process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at:', p, 'reason:', reason);
	console.error(`Api Server ({{serverName}}) exiting due to unhandledRejection...`);
	process.exit(1);
});
process.on('uncaughtException', (err) => {
	console.log('Uncaught Exception:', err);
	console.error(`Api Server ({{serverName}}) exiting due to uncaughtException...`);
	process.exit(1);
});
/*************************************************************************************/
/* END PROCESS UNHANDLED METHODS */
/* START WEBSOCKET SERVER AS SINGLETON */
/*************************************************************************************/
//If this is the first time go ahead and create the symbol.
if (globalSymbols.indexOf(SINGLETON_KEY) === -1){
	globalSpace[SINGLETON_KEY] = new ApiServer();
	globalSpace[SINGLETON_KEY].start();
}
module.exports= globalSpace[SINGLETON_KEY];