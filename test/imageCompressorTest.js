const assert = require('assert');
const imageCompressor = require('../src/data/imageCompressor');
const fs = require('fs');

describe('Testing compressorJS module', () => {
    it('Should compress the file', async () =>{
        //arrange
        const filePath = './img/boriz.png';
        const compressedFilePath = './img/borizCompressed.png'; 
        //act
        try{
            const compressedFile = await imageCompressor.compressImageAsync(filePath, compressedFilePath);
            //assert
            assert.equal(compressedFilePath, compressedFile);
        }
        catch(err) {
            throw err;
        }
    });
});