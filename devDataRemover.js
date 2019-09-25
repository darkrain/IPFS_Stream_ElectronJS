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
        const filePath = pathsToClean[i];
        try {
            if(fsExtra.existsSync(filePath))
            fsExtra.removeSync(filePath);
        } catch(err) {
            console.error(`Cannot remove folder ${filePath} \n ${err.message}`);
        }      
    }
}

cleanData();

