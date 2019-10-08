const assert = require('assert');
const appConfig = require('../appFilesConfig');
const ParserFactory = require('../src/capturing/deviceParserFactory.js');
const os = require('os');
const fs = require('fs');

describe('FFMPeg device parsers tests', () => {
    it('Parser factory should return correct parser type by OS', () => {
        const correctTypes = {
            WINDOWS: 'WinDeviceParser',
            LINUX: 'LinuxDeviceParser',
            MAC: 'MacDeviceParser'
        };
        const winParser = ParserFactory.CreateParserByOS('WINDOWS');
        const linuxParser = ParserFactory.CreateParserByOS('LINUX');
        const macParser = ParserFactory.CreateParserByOS('MAC');
        
        assert.equal(winParser.constructor.name, correctTypes['WINDOWS']);
        assert.equal(linuxParser.constructor.name, correctTypes['LINUX']);
        assert.equal(macParser.constructor.name, correctTypes['MAC']);
    });

    //SPECIFIC TEST BY PLATFORM:
    const platform = os.platform();
    if(platform === 'linux') {
        const OS_NAME = 'LINUX';
        const ffmpegPath = appConfig.getFfmpegPath(OS_NAME);
        it('Should exists in LINUX', () => {
            assert.equal(fs.existsSync(ffmpegPath), true);
        })
        it('Should return any devices in LINUX',async () => {
            const linuxParser = ParserFactory.CreateParserByOS(OS_NAME, ffmpegPath);
            const data = await linuxParser.getVideoDevices();
            console.log(`Parsed cameras: ${data}`);
            assert.equal(data.length > 0, true);
        });
    } 
});