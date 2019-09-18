const path = require('path');
const appRootPath = require('app-root-path');

function getFullPathOfFile(relativePath) {
    return path.join(appRootPath.toString(), relativePath);
}

const files = {
    FFMPEG : getFullPathOfFile('bin/ffmpeg.exe'),
    USERINFO_JSON_PATH: getFullPathOfFile('user/userInfoJSON.json')
};

module.exports = {
    files
}