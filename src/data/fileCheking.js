const fs = require('fs');

function isFileWithCorrectSizeSync(pathLike, maxSizeKB) {
    const fileStats = fs.statSync(pathLike);
    const fileSizeInBytes = fileStats['size'];
    const fileSizeInKBytes = fileSizeInBytes / 1024;
    return fileSizeInKBytes <= maxSizeKB;
}

module.exports = {
    isFileWithCorrectSizeSync
}