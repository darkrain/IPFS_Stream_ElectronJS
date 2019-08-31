async function copyImageToApplicationFolerAsync(sourceImgPath) {
    const imgExtension = pathModule.extname(sourceImgPath);
    const userFolder = 'user';
    const avaFileName = 'streamerAva';
    const avaImgNameWithExtension = avaFileName + imgExtension;
    const avaImgPathToCopy = pathModule.join(appRootPath.toString(), userFolder, avaImgNameWithExtension);
    // destination.txt will be created or overwritten by default.
    await fs.copyFile(sourceImgPath, avaImgPathToCopy, (err) => {
      if (err) {
        console.error("UNABLE TO COPY IMG.... \n" + err);
        throw err;
        }
    }); 
    return avaImgPathToCopy;
}

module.exports = {
    copyImageToApplicationFolerAsync
}