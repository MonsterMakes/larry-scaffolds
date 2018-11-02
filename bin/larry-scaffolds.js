#!/usr/bin/env node
const LarryCli = require('@monstermakes/larry-cli').LarryCli;
let registy = {
	'scaffold-node': require('../src/cli-modules/git-node-project/NodeProject.cli')
};
if(process.argv.includes('-v') || process.argv.includes('--vulgar')){
	registy.vulgar = require('../src/cli-modules/vulgar/Vulgar.cli');
}
let cli = new LarryCli(registy,{prompt: 'larry-scaffolds>'});
cli.run();