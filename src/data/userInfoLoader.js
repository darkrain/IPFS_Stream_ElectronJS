const fs = require('fs');
const appConfig = require('../../appFilesConfig');

function getUserInfoData(userInfoFilePath) {
    return new Promise((resolve, rejected) => {
        if(fs.existsSync(userInfoFilePath)) {
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
        }else {
            resolve(null);
        }
    });
}

function isUserDataReady() { 
    try {
        const data = fs.readFileSync(appConfig.files.USERINFO_JSON_PATH, 'utf8');
        const obj = JSON.parse(data);
        return Object.keys(obj).length > 0;
    } catch(err) {
        return false;
    }
}

module.exports = {
    getUserInfoData,
    isUserDataReady
}