function uploadDataAsBase64Async(ipfsInstance, data, opt = {}) {
    return new Promise((resolve, rejected) => {
        try {
            const buffer = new Buffer(data, 'base64');
            ipfsInstance.add(buffer, opt, (err, res) => {
                if(err)
                    rejected(err);
                resolve(res[0].hash);
            });
        } catch(err) {
            rejected(err);
        }
    });
}

module.exports = {
    uploadDataAsBase64Async
};