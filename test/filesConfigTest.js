const assert = require('assert');
const fs = require('fs');
const appConfig = require('../src/config/appFilesConfig.js');
const pathModule = require('path');
describe('App config path testing', () => {
    it('should all links exists', () => {
        for(let propPath in appConfig.files){
            const path = appConfig.files[propPath];
            const isExist = fs.existsSync(path);
            assert.equal(isExist, true);
        }
    });
});

describe('App config helpingFunctions: getfirstFileInFolder(path)', () => {
    it('Should return fileName when files exists', async () => {
        const path = appConfig.possibleFiles.USER_PHOTO_PATH; //path where 100% exists file
        const firstFile = await appConfig.getFirstFileInFolder(path);
        assert.equal(firstFile, 'defaultUserAva.jpg');
    });
    it('Should return null if file or path not exists', async () => {
        const path = pathModule.join(appConfig.possibleFiles.USER_PHOTO_PATH, 'fakeEmptyFolder'); //path where 100% no files
        const firstFile = await appConfig.getFirstFileInFolder(path);
        assert.equal(firstFile, null);
    });
});
describe('App config helpingFunctions: getParsedDataByPath(path)', () => {
    it('Should return dataObject if json file exists', async () => {
        const path = appConfig.files.USERINFO_JSON_PATH; //path where 100% exists file
        let fileContents = null;
        try {
            fileContents = await appConfig.getParsedDataByPath(path);
        }catch(err) {
            fileContents = null;
        }
        const isNotNull = fileContents != null;
        assert.equal(isNotNull, true);
    });
});