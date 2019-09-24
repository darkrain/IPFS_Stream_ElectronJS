const fs = require('fs');
function readFileAsBase64Async(filePath) {
    return new Promise((resolve, rejected) => {
        fs.readFile(filePath, {encoding: 'base64'}, (err, data) => {
            if(err)
                rejected(err);
            resolve(data);
        });
    });
}

function readFileFromIpfsAsBase64Async(ipfsInstance, hashIpfs) {
    return new Promise((resolve, rejected) => {
        try {
            ipfsInstance.get(hashIpfs, (err, files) => {
                if(err)
                    rejected(err);
                const file = files[0];
                const buffer = file.content;
                resolve(buffer);
            });
        } catch(err) {
            rejected(err);
        }
    });
}
module.exports =  {
    readFileAsBase64Async,
    readFileFromIpfsAsBase64Async
}