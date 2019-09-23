const assert = require('assert');
const fileHandler = require('../src/data/fileHandling');

describe('Test file converter to base64', () => {
    it('Should return base64 data', async () => {
        const filePath = "C:\\Files\\boriz.png"; //this file should exists!

        const base64Str = await fileHandler.readFileAsBase64Async(filePath);
        const isEmpty = !base64Str;
        assert.equal(isEmpty, false);
    });
});