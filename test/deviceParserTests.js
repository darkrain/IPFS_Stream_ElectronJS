const assert = require('assert');
const ParserFactory = require('../src/capturing/deviceParserFactory.js');

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
});