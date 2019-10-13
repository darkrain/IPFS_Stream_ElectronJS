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
                const base64 = Buffer.from(file.content).toString('base64');
                resolve(base64);
            });
        } catch(err) {
            rejected(err);
        }
    });
}

async function readTextFromIpfsAsync(ipfsInstance, hashIpfs) {
    const fileText = await ipfsInstance.cat(hashIpfs);
    return fileText.toString('utf8');
}

module.exports =  {
    readFileAsBase64Async,
    readFileFromIpfsAsBase64Async,
    readTextFromIpfsAsync
};