const streamerInfoGenerator = require('../data/StreamerInfoGenerator.js');

const dataDependingFlags = {
    isCameraReady: false,
    isStreamerDataReady: false   
}

let camData;
let streamInfo;
async function checkDataIsReadyAsync(ipfsInstance, electronWindow, streamInitializer, streamInfoGenerator) {   
    //LoadCameras and update web-view list
    if(!camData && dataDependingFlags.isCameraReady === false) {
        camData = await streamInitializer.initializeCameras();
        electronWindow.webContents.send('camera-list-update', camData);  
        dataDependingFlags.isCameraReady = camData.length > 0;    
    }

    if(!streamInfoGenerator) {
        console.log("Streamer info generator not ready.");
        return false;
    }

    if(!streamInfo && dataDependingFlags.isStreamerDataReady === false) {
        streamInfo = await streamInfoGenerator.getGeneratedStreamerInfo(ipfsInstance);
        //dataDependingFlags.isStreamerDataReady = true; 
    }

    //TODO: Complete data!   
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