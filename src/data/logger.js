const logger = require('logger').createLogger('development.log');
function printErr(err) {
    const errInfo = `ERR! Date: ${getCurrentDateAsString()} Err INFO:  \n ${err.message} \n ${err.stack}`;
    console.error(errInfo);
    logger.error(errInfo);
}

function getCurrentDateAsString() {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
}

module.exports = {
    printErr,
    loggerInstance: logger
};