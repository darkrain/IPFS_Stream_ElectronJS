const assert = require('assert');
const IpfsApiController = require('../src/ipfsBinWork/IpfsApiController');
const IpfsBinRunner = require('../src/ipfsBinWork/IpfsBinRunner');
describe('Test functions from data handlers', () => {
    const delay = 2000;
    let ipfsRunner = null;
    let ipfsApi = null;

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
            console.log(`Data from GET: \n ${data.substring(0, 300)}`);
        }
        assert.equal(isDataEmty, false);
    });
});