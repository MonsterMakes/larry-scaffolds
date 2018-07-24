"use strict";

const semver = require('semver')
const npmSafeName = require("npm-safe-name");
const os = require('os');
const pathUtils = require("path");
const FileScaffolder = require("../../../scaffolders/FileScaffolder");

module.exports = (larryCli)=>{
    larryCli
        .command('scaffold node-git [baseDir]', 'Scaffold a base node git project.')
        .action(function (args, callback) {
            let baseDirArg = process.cwd();
            if(args.baseDir){
                baseDirArg = args.baseDir
            }
            if(baseDirArg[0] === '~'){
                baseDirArg = pathUtils.join(os.homedir(), baseDirArg.slice(1));
            }
            let baseDir = pathUtils.resolve(baseDirArg);
            
            larryCli.log(`Scaffolding base directory: ${baseDir}`);
            
            let scaffoldData = {};

            //projectName
            this.prompt([
                {
                    type: "input",
                    name: "projectName",
                    message: "What would you like to name your project?",
                    default: pathUtils.basename(baseDir),
                    validate: function(input,answers){
                        if(npmSafeName(input) === null){
                            return "Please provide a valid npm package name.";
                        }
                        else{
                            return true;
                        }
                    }
                },
                {
                    type: "input",
                    name: "projectDescription",
                    message: "What is the purpose of your project?"
                },
                {
                    type: "input",
                    name: "projectVersion",
                    message: "What is your projects starting semver?",
                    default: "0.0.1",
                    validate: function(input,answers){
                        if(semver.valid(input) === null){
                            return "Please provide a valid semver, see semver.org for more details.";
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