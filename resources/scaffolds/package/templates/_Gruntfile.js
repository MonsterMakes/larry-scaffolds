'use strict';
const GruntBuild = require('@gluenetworks/bacon').GruntBuild;
module.exports = function (grunt) {
	let build = new GruntBuild(grunt);
	build.loadDefaultTasks({coverage: false, jshint: true});
};
