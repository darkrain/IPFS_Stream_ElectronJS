const logger = require('logger').createLogger('development.log');
function printErr(err) {
    console.error(` ${err.message} \n ${err.stack}`);
    logger.error(err.message, err.stack);
}

module.exports = {
    printErr,
    loggerInstance: logger
};