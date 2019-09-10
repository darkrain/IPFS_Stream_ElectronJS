const assert = require('assert');
const converterModule = require('../src/helpers/dataConverters.js');

describe('should decode to streamblock', () => {
    it('will be decoded', () => {
        const encodedData = 'eyJFWFRJTkYiOiJFWFRJTkY6OC4zMzMzMzMiLCJGSUxFX05BTUUiOiJtYXN0ZXIxMS50cyIsIlZJREVPX0NIVU5LX0hBU0giOiJRbVRtank5bXhNbmNTRWpoQmt3Sm44RW55TUZjRmthUlNwRVZNR2llS2lYakRzIiwibGluayI6eyIvIjoiYmFmeXJlaWF2cHVtYmlxdm83YWlrNm9rM2xyZDVoamdyZXE0enpybXpoenN1YWV3NGxtd21heDVpdGkifX0='; 
        const convertedData = converterModule.convertBase64DataToObject(encodedData);
        console.log('data: \n' + JSON.stringify(convertedData));
        const extinf = convertedData.EXTINF;
        const fileName = convertedData.FILE_NAME;
        const videoChunkHash = convertedData.VIDEO_CHUNK_HASH;  
        assert.equal(extinf, "EXTINF:8.333333");
        assert.equal(fileName, "master11.ts");
        assert.equal(videoChunkHash, "QmTmjy9mxMncSEjhBkwJn8EnyMFcFkaRSpEVMGieKiXjDs");
    })
})
