const assert = require('assert');
const fs = require('fs');
const appConfig = require('../src/config/appFilesConfig.js');
describe('App config path testing', () => {
    it('should all links exists', () => {
        for(let propPath in appConfig){
            const path = appConfig[propPath];
            const isExist = fs.existsSync(path);
            assert.equal(isExist, true);
        }
    });
});