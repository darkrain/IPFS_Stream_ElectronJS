let allDataIsReady = false;
let camData;
async function checkDataIsReadyAsync(electronWindow, streamInitializer) {   
    //LoadCameras and update web-view list
    if(!camData) {
        camData = await streamInitializer.initializeCameras();
        electronWindow.webContents.send('camera-list-update', camData);
    }
    
    return allDataIsReady;
}

module.exports = {
    checkDataIsReadyAsync
}