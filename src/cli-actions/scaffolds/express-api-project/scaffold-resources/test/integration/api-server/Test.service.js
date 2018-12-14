'use strict';

class Test {
	constructor(context){
		this._apiServer = context.apiServer;
	}
	/**
	 * @swagger
	 * /test-query:
	 *   get:
	 *     serviceMethod: Test.testQuery
	 *     description: testQuery
	 *     produces:
	 *       - application/json
	 *     parameters:
	 *       - name: id
	 *         in: query
	 *         description: ID of the object to fetch
	 *         required: true
	 *         schema:
	 *           type: array
	 *           style: simple
	 *           items:
	 *             type: string 
	 *     responses:
	 *       200:
	 *         description: testQuery
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               required:
	 *                 - status
	 *               properties:
	 *                 status:
	 *                   type: string
	 *                   enum:
	 *                     - INITIALIZING
	 *                     - UNKNOWN
	 *                     - STARTING
	 *                     - LISTENING
	 *                     - CONNECTED
	 *                     - ERRORD
	 */
	testQuery(requestHelper,responseHelper){//eslint-disable-line
		return {
			status: this._apiServer.getStatus()
		};
	}
	/**
	 * @swagger
	 * /test-500-response:
	 *   get:
	 *     serviceMethod: Test.testQuery500
	 *     description: testQuery500
	 *     produces:
	 *       - application/json
	 *     responses:
	 *       200:
	 *         description: testQuery500
	 */
	testQuery500(requestHelper,responseHelper){//eslint-disable-line
		responseHelper.respondWithError('Bad things',{},500);
	}
	/**
	 * @swagger
	 * /test-throw:
	 *   get:
	 *     serviceMethod: Test.testThrow
	 *     description: testThrow
	 *     produces:
	 *       - application/json
	 *     responses:
	 *       200:
	 *         description: testThrow
	 */
	testThrow(requestHelper,responseHelper){//eslint-disable-line
		throw new Error('Another way to send a 400');
	}
}
module.exports = Test;