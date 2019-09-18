const assert = require('assert');
const appConfig = require('../src/config/appFilesConfig');
const userInfoLoader = require('../src/data/userInfoLoader');
describe('UserInfo loader functional testing', () => {
    it('Should return data when file exists', async () => {
        //Arrange
        const userFilePath = appConfig.files.USERINFO_JSON_PATH; //this file should exists for this test!
        //Act
        const userData =  await userInfoLoader.getUserInfoData(userFilePath);
        const keys = Object.keys(userData);//should be properties like: name and nickname
        //Assert
        assert.equal(userData != null, true);
        assert.equal(keys.length, 3);
    });
    it('Should return null if data not exists', async () => {
        const fakePath = appConfig.files.USERINFO_JSON_PATH + 'abracadabra';
        
        const userData = await userInfoLoader.getUserInfoData(fakePath);
        
        assert.equal(userData == null, true);
    });
});