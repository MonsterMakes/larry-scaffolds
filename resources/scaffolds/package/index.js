"use strict";
const WebPackageScaffold = require("./WebPackageScaffold");

class WebPackageAction {
    constructor(steveCli,inquirer) {
        this._steveCli = steveCli;
        this._inquirer = inquirer;
    }
    doIt(){
        let prom = new Promise((resolve,reject)=>{
            let scfld = new WebPackageScaffold(this._steveCli.getCwd());
            this._inquirer.prompt(scfld.prompts).then((answers)=>{
                //Ask the appropriate Questions
                let scaffoldProm = scfld.scaffold(answers);
                if(scaffoldProm && Promise.prototype.isPrototypeOf(scaffoldProm)) {
                    scaffoldProm
                        .then(resolve)
                        .catch(reject);
                }
                else{
                    resolve();
                }
            });
        });
        return prom;
    }
}
WebPackageAction.$name = "Webpackage Scaffold";

module.exports = WebPackageAction;