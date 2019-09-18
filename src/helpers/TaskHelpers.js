function sleep(timeMS) {
    return new Promise(resolve => {
        setTimeout(resolve, timeMS);
    });
}

module.exports = {
    sleep
}