#!/usr/bin/env node
"use strict";

const _ = require("lodash");
const fs = require("fs");
const os = require('os');
const pathUtils = require("path");
const Vorpal = require("vorpal");
const chalk = Vorpal().chalk;

const larry = Vorpal();

larry
    .command('pwd', 'What directory am I in?')
    .action((args, callback)=>{
        larry.log(process.cwd());
        callback();
    });


let minimistResults = larry.parse(process.argv.slice(0), {use: 'minimist'});

//get the larry config file
let larryConfigPath = _.get(minimistResults,"c",_.get(minimistResults,"config"));

let config = minimistResults;

let loadDefaultConfig = (contents)=>{
    let larryRc = JSON.parse(contents);
    _.defaults(config,larryRc,{

    });
};

if(larryConfigPath){
    try{
        let contents = fs.readFileSync(larryConfigPath);  
        loadDefaultConfig(contents);
    }
    catch(e){
        larry.log(chalk.red(`Failed to load .larryrc (${larryConfigPath}) - ${e.message}`));
    }
}
else{
    try{
        let contents = fs.readFileSync(os.homedir()+pathUtils.sep+'.larryrc');
        loadDefaultConfig(contents);
    }
    catch(e){/*No .larryrc no worries*/}
}
    
//setup default prompt
larry.delimiter(chalk.blue('larry>'));

//load vulgar
if(config.vulgar){
    process.argv.splice(process.argv.indexOf("--vulgar"),1);
    //mutate process.argv
    minimistResults = larry.parse(process.argv, {use: 'minimist'});
    const vulgarCli = require("../src/cli/vulgar/vulgar.cli");
    vulgarCli(larry);
}

//load supplied cli
if(config.use){
    process.argv.splice(process.argv.indexOf("--use"),2);
    //mutate process.argv
    minimistResults = larry.parse(process.argv, {use: 'minimist'});
    larry.use(config.use);
}

//launch the cli
larry.show();

//if someone passed commands via the command line
if(minimistResults._ && minimistResults._.length){
    larry.parse(process.argv);
}