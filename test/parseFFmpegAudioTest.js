const assert = require('assert');
const audioHelper = require('../src/helpers/ffmpegAudioHelper.js');
const appConfig = require('../src/config/appFilesConfig.js');
// AAA pattern.
describe('Parsing ffmpeg audio devices', () => {
    it('Should return more than 0 audio devices', async () => {
        //Arrange
        const audioDevices = await audioHelper.getAudioNamesAsync(appConfig.files.FFMPEG);
        //Act
        const isEmpty = audioDevices.length === 0;
        //Assert
        assert.equal(isEmpty, false);       
    });
});