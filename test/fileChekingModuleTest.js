const assert = require('assert');
const fileChecker = require('../src/data/fileCheking');
describe.skip('Testing file size blocker function', () => {
    it('Should returns true when file have a correct size in KB', () =>{
        //arrange
        const filePath = 'C:\\Files\\boriz.png';
        const fileMaxSizeKB = 500;
        //act
        const isFileSizeCorrect = fileChecker.isFileWithCorrectSizeSync(filePath, fileMaxSizeKB);
        //assert
        assert.equal(isFileSizeCorrect, true);
    });
    it('Should refuse when file have not correct size in KB', () => {
        //arrange
        const filePath = 'C:\\Files\\boriz.png';
        const fileMaxSizeKB = 200;
        //act
        const isFileSizeCorrect = fileChecker.isFileWithCorrectSizeSync(filePath, fileMaxSizeKB);
        //assert
        assert.equal(isFileSizeCorrect, false);
    });
});