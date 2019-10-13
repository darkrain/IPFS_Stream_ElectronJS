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

async function uploadTextDataAsync(ipfsInstance, data) {
    const bufferedData = new Buffer(data);
    const results = await ipfsInstance.add(bufferedData);
    return results[0].hash;
}

module.exports = {
    uploadDataAsBase64Async,
    uploadTextDataAsync
};