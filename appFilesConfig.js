const osDetector = require('./src/helpers/OSDetecting.js');
const os = require('os');
const path = require('path');
const fs = require('fs');
const _HOME_ = require('os').homedir();
const _SEP_ = require('path').sep;
const _APPHOME_ = `${_HOME_}${_SEP_}.borgStream${_SEP_}`;

const USER_FOLDERS = [
    'bin',
    'bin/ffprobe',
    'bin/ffprobe/win32',
    `bin/ffprobe/win32/${os.arch()}`,
    'user',
    'user/userData',
    'user/userData/streamers',
    'user/img',
    'user/img/photo',
    'user/streamRecords',
    'videos'
];

const ROOMS = {
    SAVE_GLOBAL_ROOM: "SaveGlobalRoom"
};

const APP_USER_FOLDER_PATHS = {
    BIN: getFullPathOfFileFromSystemPath('bin'),
    USER: getFullPathOfFileFromSystemPath('user'),
    VIDEOS: getFullPathOfFileFromSystemPath('videos')
};

//in app folder
function getFullPathOfFile(relativePath) {
    return path.join(__dirname, relativePath);
}

//in app data file system folder
function getFullPathOfFileFromSystemPath(relativePath) {
    const fullPath = path.join(_APPHOME_, relativePath);
    return fullPath;
}

async function initializeBasicFolders() {
    await new Promise((resolve, rejected) => {
        try {
            if(!fs.existsSync(_APPHOME_))
                fs.mkdirSync(_APPHOME_); //firstable appData folder       
            for(const index in USER_FOLDERS) {
                const folderPath = path.join(_APPHOME_, USER_FOLDERS[index]);
                if(!fs.existsSync(folderPath))
                    fs.mkdirSync(folderPath);
            }
            resolve();
        } catch(err) {
            rejected(err);
        }
    }); 
    try {
        await copyNecessaryData();
    } catch(err) {    
        throw err;
    }  
}

async function copyNecessaryData() {
    try {
        const copyPaths = [
            'bin/ffmpeg.exe',
            `bin/ffprobe/win32/${os.arch()}/ffprobe.exe`
        ];
        for(const index in copyPaths) {
            const relativePath = copyPaths[index];
            const fullFilePath = getFullPathOfFile(relativePath);
            const destFilePath = getFullPathOfFileFromSystemPath(relativePath);
            if(fs.existsSync(destFilePath)) {
                console.log(`File ${destFilePath} exists, continue..`);
                continue;
            }
            console.log(`File ${destFilePath} not exists! Copy...`);
            await new Promise((resolve, rejected) => {
                fs.copyFile(fullFilePath, destFilePath, (err) => {
                    if(err)
                        rejected(err);
                    resolve();
                });
            });
        }
    } catch(err) {
        throw err;
    }
}

function getFfmpegPath(currentOs = osDetector.getOs()) {
    let ffmegPath = null;
    switch(currentOs) {
        case 'LINUX': {
            ffmegPath = `${_SEP_}usr${_SEP_}bin${_SEP_}ffmpeg`;
            break;
        }
        case 'MAC': {
            throw new Error("No implement ffmpeg path for mac yet...");
        }   
        case 'WINDOWS': {
            ffmegPath = getFullPathOfFileFromSystemPath('bin/ffmpeg.exe');
            break;
        }
        default: {
            throw new Error("Cannot specify your OS to get FFMPEG PATH :-(!");
        }
    }
    return ffmegPath;
}

const files = {
    FFPROBE: getFullPathOfFileFromSystemPath(`bin/ffprobe/win32/${os.arch()}/ffprobe.exe`),
    FFMPEG : getFfmpegPath(),
    USERINFO_JSON_PATH: getFullPathOfFileFromSystemPath('user/userInfoJSON.json'),
    USER_STREAM_INFO_JSON_PATH: getFullPathOfFileFromSystemPath('user/userStreamInfo.json'),
    SAVED_STREAMS_DATA_JSON_PATH: getFullPathOfFileFromSystemPath('user/savedStreams.json')
};

const folders = {
    USER_PAGE: getFullPathOfFile('front/userInfoPage'),
    USER_DATA_PATH: getFullPathOfFileFromSystemPath('user/userData'),
    USER_PHOTO_PATH: getFullPathOfFileFromSystemPath('img/photo'),
    STREAM_RECORDS_FOLDER: getFullPathOfFileFromSystemPath('user/streamRecords')
};

const fileSizes = {
    MAX_USER_AVA_KB_SIZE: 200,
    MAX_STREAM_AVA_KB_SIZE: 500
};

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
    HOME: _APPHOME_,
    APP_USER_FOLDER_PATHS,
    files,
    folders,
    getFirstFileInFolder,
    getFullPathOfFile,
    getParsedDataByPath,
    fileSizes,
    initializeBasicFolders,
    getFullPathOfFileFromSystemPath,
    getFfmpegPath,
    ROOMS
};