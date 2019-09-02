const pathModule = require('path');
const fs = require('fs');
const appRootPath = require('app-root-path');

const USER_FOLDER = 'user';
const AVA_FILE_NAME = 'streamerAva';
const USER_PATH = pathModule.join(appRootPath.toString(), USER_FOLDER); 

async function copyImageToApplicationFolerAsync(sourceImgPath) {

    //firstable clear another avaImages if it exists..
    await removeImagesIfFileExistsAsync();

    const imgExtension = pathModule.extname(sourceImgPath);
    const avaImgNameWithExtension = AVA_FILE_NAME + imgExtension;
    const avaImgPathToCopy = pathModule.join(USER_PATH, avaImgNameWithExtension);

    let avatarPath = await new Promise((resolve, rejected) => {
        fs.copyFile(sourceImgPath, avaImgPathToCopy, (err) => {
            if (err) {
              console.error("UNABLE TO COPY IMG.... \n" + err);
              rejected(null);
            }
            resolve(avaImgPathToCopy);
          });
    });

    if(!avatarPath)
        throw new Error("IMG_LOADER_HEPLER: Avatar path is null!");

    return avatarPath;
}

function removeImagesIfFileExistsAsync() {
    return new Promise((resolve, reject) => {
        fs.readdir(USER_PATH, (err, files) => {
            if(err) {
                console.error("Cannot read path: " + USER_PATH + "\n" + err.name);
                reject();
            }
            for(let i = 0; i < files.length; i++) {
                const fileName = files[i];
                if(fileName.includes(AVA_FILE_NAME)) {
                    const filePath = pathModule.join(USER_PATH, fileName);
                    console.log("Try to remove file: " + filePath + "....");
                    fs.unlinkSync(filePath);
                }
            }

            resolve();
        });
    });
}

module.exports = {
    copyImageToApplicationFolerAsync
}