const os = require('os');

const platforms = {
    linux: 'LINUX',
    darwin: 'MAC',
    win32: 'WINDOWS'
}

function getOs(){
    const currentPlatform = os.platform();
    const normalizedKey = platforms[currentPlatform];
    if(!normalizedKey)
        return null;
    return normalizedKey;
}
getOs();
module.exports = {

};