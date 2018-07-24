const pkg = require("../../package.json");
const CoreLogger = require("larry-logger");
module.exports = CoreLogger.getConsoleLogger(pkg.name);