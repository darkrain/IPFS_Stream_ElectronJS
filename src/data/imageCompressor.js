const tinify = require("tinify");
tinify.key = "3bGHxkChJWFLlBnB6WWKnDF9DW5wSM1y";

function compressImageAsync(sourceFilePath, outputFilePath) {
    return new Promise((resolve, reject) => {
        try {
            const source = tinify.fromFile(sourceFilePath);
            source.toFile(outputFilePath);
            resolve(outputFilePath);
        } catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    compressImageAsync
}