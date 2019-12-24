const assert = require('assert');
const IpfsApiController = require('../src/ipfsBinWork/IpfsApiController');
const IpfsBinRunner = require('../src/ipfsBinWork/IpfsBinRunner');
const pathModule = require('path');
const fs = require('fs');

const videoPath = pathModule.resolve('C:\\Users\\intfl\\Videos\\fromIPFS');
const testFilePath = pathModule.join(videoPath, 'yodaTest.mp4');

describe('Test functions from data handlers', () => {
    const delay = 2000;
    let ipfsRunner = null;
    let ipfsApi = null;

    let bufferData = null;
    //video file hash
    let hash = null;

    before(async () => {
        ipfsRunner = new IpfsBinRunner();
        await new Promise(resolve => setTimeout(resolve, delay));
        ipfsApi = new IpfsApiController(ipfsRunner);
    });

    it('should ADD data to IPFS', async () => {
        hash = await ipfsApi.addFileAsync(testFilePath);
        assert.equal(hash === null, false);
    });

    it('Should GET data by hash', async () => {
        const data = await ipfsApi.getFileAsync(hash);
        const isDataEmty = !data;
        if(!isDataEmty) {
            bufferData = data;
        }
        assert.equal(isDataEmty, false);
    });

    it('Should correct save file in FS', () => {
        const newFileName = `downloaded.mp4`;
        const pathToSave = pathModule.join(videoPath, newFileName);
        let isDone = false;
        try {
            fs.writeFileSync(pathToSave, bufferData);
            isDone = true;
        } catch(err) {
            console.error(err.toString());
            isDone = false;
        }
        
        assert.equal(isDone, true);
    });
});