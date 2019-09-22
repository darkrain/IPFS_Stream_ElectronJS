const logger = require('logger').createLogger('development.log');
function printErr(err) {
    logger.error(err.message, err.stack);
}

module.exports = {
    printErr,
    loggerInstance: logger
};