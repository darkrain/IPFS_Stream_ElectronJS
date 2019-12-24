const assert = require('assert');
const IpfsApiController = require('../src/ipfsBinWork/IpfsApiController');
const IpfsBinRunner = require('../src/ipfsBinWork/IpfsBinRunner');
const pathModule = require('path');
const fs = require('fs');

const videoPath = pathModule.resolve('C:\\Users\\intfl\\Videos\\fromIPFS');

describe('Test functions from data handlers', () => {
    const delay = 2000;
    let ipfsRunner = null;
    let ipfsApi = null;

    let bufferData = null;
    //video file hash
    const hash = "QmfZMmf5xGhxcnv1ytzuAWidodwYgKGkcQky1ohcneAbau";

    before(async () => {
        ipfsRunner = new IpfsBinRunner();
        await new Promise(resolve => setTimeout(resolve, delay));
        ipfsApi = new IpfsApiController(ipfsRunner);
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
        fs.writeFileSync(pathToSave, bufferData);
    });
});