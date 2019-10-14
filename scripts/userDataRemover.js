const fsExtra = require('fs-extra');
const appConfig = require('../appFilesConfig');

function removeUserData() {
    fsExtra.emptyDir(appConfig.HOME);
}

removeUserData();