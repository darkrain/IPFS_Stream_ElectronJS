const fs = require('fs');

function readFileAsBase64Async(filePath) {
    return new Promise((resolve, rejected) => {
        fs.readFile(filePath, {encoding: 'base64'}, (err, data) => {
            if(err)
                rejected(err);
            resolve(data);
        })
    });
}

module.exports =  {
    readFileAsBase64Async
}