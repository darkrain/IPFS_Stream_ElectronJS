const appConfig = require('../appFilesConfig');
const fsExtra = require('fs-extra');
const pathModule = require('path');
const VIDEO_PATH = appConfig.APP_USER_FOLDER_PATHS.VIDEOS;
removeVideosFromVideoFolder();

function removeVideosFromVideoFolder() {
    try {
        //fsExtra.rmdirSync(appConfig.APP_USER_FOLDER_PATHS.VIDEOS);
        fsExtra.emptyDirSync(VIDEO_PATH);
        
    } catch(err) {
        console.error(`Cannot delete video folder! \n ${err.toString()}`);
    }
}