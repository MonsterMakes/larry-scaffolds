"use strict";
const _ = require("lodash");
_.mixin((require("underscore.string")).exports());

const pathUtils = require("path");
const BaseScaffold = require("../../../lib/scaffold/BaseScaffold");

class WebPackageScaffold extends BaseScaffold{
    constructor(cwd, data){
        super(cwd,data,__dirname);
    }

    /**
     * @typedef WebPackageScaffoldData
     * @property {string} webPkgName - Name of the Webpackage
     * @property {string} webPkgDescription - Description for the Webpackage
     * @param templateData
     */
    get prompts(){
        return [
            {
                type: "input",
                name: 'webPkgName',
                message: "What would you like to name your Web Package?",
                default: process.cwd().split(pathUtils.sep).pop()
            },
            {
                type: "input",
                name: 'webPkgDescription',
                message: "Describe the purpose of your Web Package?"
            }
        ];
    }

    /**
     * Scaffold out a web package
     * @param {WebPackageScaffoldData} [data=this._data] - data used to scaffold out a web package.
     */
    scaffold(data){
        if(!data){
            data = this.data;
        }
        if(!_.has(data,"currentYear")){
            _.set(data,"currentYear",new Date().getFullYear());
        }

        data.webPkgName = _.underscored(data.webPkgName);

        return new Promise((resolve)=>{
            data.directories = [this.src+pathUtils.sep+'src'];
            //Scaffold out the WebPackage
            this._scaffoldHelper.scaffold(data);
            resolve();
        });
    }
}
module.exports = WebPackageScaffold;