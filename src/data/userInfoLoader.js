const fs = require('fs');
const appConfig = require('../../appFilesConfig');

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
    //test
    return false;
    const data = fs.readFileSync(appConfig.files.USERINFO_JSON_PATH, 'utf8');
    try {
        const obj = JSON.parse(data);

        console.log("Keys length: " + Object.keys(obj).length);
        return Object.keys(obj).length > 0;
    } catch(err) {
        console.log("Some error in user data checker: " + err.toString());
        return false;
    }
}

module.exports = {
    getUserInfoData,
    isUserDataReady
}