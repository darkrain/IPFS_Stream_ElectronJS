const appConfig = require('../appFilesConfig');
const os = require('os');
const assert = require('assert');
const osDetector = require('../src/helpers/OSDetecting');
const fs = require('fs');

describe('Test ffmpeg path on specific OS:', () => {
    const platform = os.platform();
        let currentOs = platform;
        if(platform === 'win32')
            currentOs = 'WINDOWS';
        else if(platform === 'linux')
            currentOs = 'LINUX';
        else if(platform === 'darwin')
            currentOs = 'MAC';
        else
            currentOs = 'UNDEFINED';
    it('Should return correct OS', () => {   
        const detectingOs = osDetector.getOs(); 
        assert.equal(currentOs, detectingOs);
    })
    
    it('Should returns correct path of FFMPEG', () => {
        const ffmpegPath = appConfig.files.FFMPEG;
        const isFFmpegExists = fs.existsSync(ffmpegPath);
        assert(isFFmpegExists, true);
    });
});