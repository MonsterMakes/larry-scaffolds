'use strict';
const CliModule = require('@monstermakes/larry-cli').CliModule;
const semver = require('semver');
const npmSafeName = require('npm-safe-name');
const os = require('os');
const pathUtils = require('path');
const FileScaffolder = require('../../../scaffolders/FileScaffolder');

class WebAppProjectCli extends CliModule {
	constructor(vorpalInstance){
		super(vorpalInstance);
		this._init();
	}
	_init(){
		this._vorpalInstance
			.command('scaffold web-app [baseDir]', 'Scaffold a base 12 factor web app project.')
			.action(function (args, callback) {
				let baseDirArg = process.cwd();
				if(args.baseDir){
					baseDirArg = args.baseDir;
				}
				if(baseDirArg[0] === '~'){
					baseDirArg = pathUtils.join(os.homedir(), baseDirArg.slice(1));
				}
				let baseDir = pathUtils.resolve(baseDirArg);
				
				this.log(`Scaffolding base directory: ${baseDir}`);

				//projectName
				this.prompt([
					{
						type: 'input',
						name: 'projectName',
						message: 'What would you like to name your project?',
						default: pathUtils.basename(baseDir),
						validate: function(input,answers){ // eslint-disable-line
							if(npmSafeName(input) === null){
								return 'Please provide a valid npm package name.';
							}
							else{
								return true;
							}
						}
					},
					{
						type: 'input',
						name: 'projectDescription',
						message: 'What is the purpose of your project?'
					},
					{
						type: 'input',
						name: 'projectGitUrl',
						message: 'What is the url to your git repository?',
						default: (answers)=>{
							let githubProjPath = answers.projectName.replace(/^@/,'');
							let url = `https://github.com/${githubProjPath}`;
							return url;
						}
					},
					{
						type: 'input',
						name: 'projectVersion',
						message: 'What is your projects starting semver?',
						default: '0.0.1',
						validate: function(input,answers){ // eslint-disable-line
							if(semver.valid(input) === null){
								return 'Please provide a valid semver, see semver.org for more details.';
							}
							else{
								return true;
							}
						}
					},
				]).then(answers => {
					let scfldr = new FileScaffolder(
						`${__dirname}/scaffold-resources`, 
						answers, 
						baseDir
					);
					return scfldr.scaffold()
						.then(()=>{
							callback();
						});
				});
			});
	}
}
module.exports = WebAppProjectCli;