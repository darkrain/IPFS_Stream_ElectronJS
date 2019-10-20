function convertBase64DataToObject(encodedData) {
    const buff = new Buffer(encodedData, 'base64');
    return JSON.parse(buff.toString());
}

function convertObjectToBase64String(object) {
    const stringifyObj = JSON.stringify(object);
    const buff = new Buffer(stringifyObj);
    return buff.toString('base64');
}

module.exports = {
    convertBase64DataToObject,
    convertObjectToBase64String
};