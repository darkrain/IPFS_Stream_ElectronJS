function convertBase64DataToObject(encodedData) {
    const buff = new Buffer(encodedData, 'base64');
    return JSON.parse(buff.toString('ascii'));
}

module.exports = {
    convertBase64DataToObject
}