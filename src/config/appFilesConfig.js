const path = require('path');
const appRootPath = require('app-root-path');
const fs = require('fs');

function getFullPathOfFile(relativePath) {
    return path.join(appRootPath.toString(), relativePath);
}

const files = {
    FFMPEG : getFullPathOfFile('bin/ffmpeg.exe'),
    USERINFO_JSON_PATH: getFullPathOfFile('user/userInfoJSON.json')
};

const possibleFiles = {
    USER_PHOTO_PATH: getFullPathOfFile('front/userInfoPage/img/photo')
}

function getFirstFileInFolder(path) {
    return new Promise((resolve, rejected) => {
        if(fs.existsSync(path)) {
            fs.readdir(path, (err, files) => {
                if(err) {
                    rejected(err);
                } 
                if(files.length >= 0) {
                    resolve(files[0]);
                } else {
                    resolve(null);
                }
            });
        } else {
            resolve(null);
        }
    });
}

module.exports = {
    files,
    possibleFiles,
    getFirstFileInFolder,
    getFullPathOfFile
}