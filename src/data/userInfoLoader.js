const fs = require('fs');
const appConfig = require('../config/appFilesConfig');

function getUserInfoData(userInfoFilePath) {
    return new Promise((resolve, rejected) => {
        fs.exists(userInfoFilePath, isExists => {
            if(isExists) {
                fs.readFile(userInfoFilePath, 'utf8',(err, data) => {
                    if(err)
                        rejected(err);
                    try {
                        const userData = JSON.parse(data);
                        resolve(userData);
                    } catch(err) {
                        rejected(err);
                    }
                });
            } else {
                resolve(null);
            }
        });
    });
}

function isUserDataReady() {
    return fs.existsSync(appConfig.files.USERINFO_JSON_PATH);
}

module.exports = {
    getUserInfoData,
    isUserDataReady
}