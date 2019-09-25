const pathModule = require('path');
const fsExtra = require('fs-extra');
const appRootPath = require('app-root-path');
const buildSource = pathModule.join(appRootPath.toString(), 'dist'); 
const shareFolder = `C://virtualBoxShare//`;
function copyBuildFiles() {
    const buildDest = pathModule.join(shareFolder, `dist${Date.now().toString()}`);
    fsExtra.mkdirSync(buildDest);
    if(fsExtra.existsSync(buildSource))
        fsExtra.moveSync(buildSource, buildDest);
}

copyBuildFiles();
