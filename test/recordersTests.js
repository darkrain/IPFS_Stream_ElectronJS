const assert = require('assert');
const RecorderFactory = require('../src/capturing/recorderFactory');

describe('Test recorder factory', () => {
    it('Should return correct recorder type by OS', () => {
        const correctTypes = {
            WINDOWS: 'WindowsRecorder',
            LINUX: 'LinuxRecorder',
            MAC: 'MacRecorder'
        };

        const winRecorder = RecorderFactory.CreateRecorderByOS('WINDOWS', null, 'null');
        const linuxRecorder = RecorderFactory.CreateRecorderByOS('LINUX', null, 'null');
        const macRecorder = RecorderFactory.CreateRecorderByOS('MAC', null, 'null');

        assert.equal(winRecorder.constructor.name, correctTypes['WINDOWS']);
        assert.equal(linuxRecorder.constructor.name, correctTypes['LINUX']);
        assert.equal(macRecorder.constructor.name, correctTypes['MAC']);
    });
});