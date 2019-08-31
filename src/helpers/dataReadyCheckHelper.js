const dataDependingFlags = {
    isCameraReady: false,
    isStreamerDataReady: false   
}

let camData;
async function checkDataIsReadyAsync(electronWindow, streamInitializer) {   
    //LoadCameras and update web-view list
    if(!camData && dataDependingFlags.isCameraReady != false) {
        camData = await streamInitializer.initializeCameras();
        electronWindow.webContents.send('camera-list-update', camData);  
        dataDependingFlags.isCameraReady = camData.length > 0;    
    }
    
    return isAllDataReady();
}

function isAllDataReady() {
    console.log(`Checking is all data ready: \n 
        cameraReady:${dataDependingFlags.isCameraReady} \n 
        streamerDataReady: ${dataDependingFlags.isStreamerDataReady}`);
        
    return dataDependingFlags.isCameraReady && dataDependingFlags.isStreamerDataReady;
}

module.exports = {
    checkDataIsReadyAsync
}