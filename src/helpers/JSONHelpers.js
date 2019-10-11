function simplifyStringifyValue(jsonData, maxLength = 20) {
    return JSON.stringify(jsonData, function(key, value) {
        if (typeof value === 'string' && value.length > maxLength) {
            return value.substr(0, maxLength);
        }
        return value;
    });
}

module.exports = {
    simplifyStringifyValue
};