const assert = require('assert');
const converterModule = require('../src/helpers/dataConverters.js');

describe('Should convert raw data to json', () => {
    const encodedData = 'eyJuYW1lT2ZTdHJlYW0iOiJBUl9CYWJ5WiIsImhhc2hPZlN0cmVhbWVyIjoiZmNjOGM1NmNiOTMyNmM4NjBhNjEwNmYyZGY4NDNiODEiLCJpbWdBdmFIYXNoIjoiUW1TY2RkWkZ4RFNHV3dyQ1hxNTNNeGtHTHhzWVp2cUNUdlhFaUdmenVtRXFWVyJ9';

    const convertedData = converterModule.convertBase64DataToObject(encodedData);

    const nameOfStream = convertedData.nameOfStream;
    const hashOfStreamer = convertedData.hashOfStreamer;
    const imgAvaHash = convertedData.imgAvaHash;
    it('Name should be getted:', () => {
        assert.equal(nameOfStream, "AR_BabyZ");
    });
    it('Hash should be getted: ', () => {
        assert.equal(hashOfStreamer, "fcc8c56cb9326c860a6106f2df843b81");
    });
    it('imgAvaHash should be getted: ', () => {
        assert.equal(imgAvaHash, "QmScddZFxDSGWwrCXq53MxkGLxsYZvqCTvXEiGfzumEqVW");
    });
});
