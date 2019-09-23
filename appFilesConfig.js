const path = require('path');
const fs = require('fs');
const _HOME_ = require('os').homedir();
const _SEP_ = require('path').sep;
const _APPHOME_ = `${_HOME_}${_SEP_}.borgStream${_SEP_}`;

//in app folder
function getFullPathOfFile(relativePath) {
    return path.join(__dirname, relativePath);
}

//in app data file system folder
function getFullPathOfFileFromSystemPath(relativePath) {
    //create appHome if not exists
    if(!fs.existsSync(_APPHOME_)) {
        initializeBasicFolders();
        console.log("APP HOME CREATED!: " + _APPHOME_);
    }
    const fullPath = path.join(_APPHOME_, relativePath);
    if(!fs.existsSync(fullPath))
    return ;
}

function initializeBasicFolders() {
    fs.mkdirSync(_APPHOME_); //firstable appData folder
    
}

const files = {
    FFMPEG : getFullPathOfFile('bin/ffmpeg.exe'),
    USERINFO_JSON_PATH: getFullPathOfFile('user/userInfoJSON.json'),
    USER_PHOTO_PATH: getFullPathOfFile('front/userInfoPage/img/photo')
};

const folders = {
    USER_PAGE: getFullPathOfFile('front/userInfoPage')
}

const possibleFiles = {
    USER_PHOTO_PATH: getFullPathOfFile('front/userInfoPage/img/photo')
}

const fileSizes = {
    MAX_USER_AVA_KB_SIZE: 200,
    MAX_STREAM_AVA_KB_SIZE: 500
}

function getParsedDataByPath(path) {
    return new Promise((resolve, rejected) => {
        if(!fs.existsSync(path))
            rejected(new Error('Cannot load file, its not exists in path: ' + path));
        fs.readFile(path, 'utf8', (err, data) => {
            if(err) {
                rejected(err);
            } try {
                const dataObject = JSON.parse(data);
                resolve(dataObject);
            } catch(er) {
                rejected(er);
            }
        });    
    });
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
    folders,
    possibleFiles,
    getFirstFileInFolder,
    getFullPathOfFile,
    getParsedDataByPath,
    fileSizes
}