//Script to clean unecessary data, when dev
const fsExtra = require('fs-extra');
const path = require('path');
const pathsToClean = [
    path.join(__dirname, 'ipfs'),
    path.join(__dirname, 'videos'),
    path.join(__dirname, 'dist')
]

function cleanData() {
    for(const i in pathsToClean) {
        if(fsExtra.existsSync(pathsToClean[i]))
            fsExtra.removeSync(pathsToClean[i]);
    }
}

cleanData();

