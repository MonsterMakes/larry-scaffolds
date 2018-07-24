'use strict';

module.exports = function() {
    let fs = require("fs-extra");

    let TEST_DIR_PREFIX = 'test/working_dir/';

    return {
        cleanUpWorkingDirs: function (testName) {
            //Clean up any previous tests
            fs.removeSync(TEST_DIR_PREFIX + testName);
            fs.removeSync(TEST_DIR_PREFIX +"/.DS_Store");
            fs.mkdirsSync(TEST_DIR_PREFIX + testName);
        },
        getUniqueTestDirPath: function (testName) {
            return TEST_DIR_PREFIX + testName + "/" + new Date().getTime();
        },
        getWorkingDir: function(TEST_DIR){
            return TEST_DIR+"/WORKING_DIRECTORY";
        }
    };
};