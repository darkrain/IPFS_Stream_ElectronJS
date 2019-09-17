const dataDependingFlags = {
    isCameraReady: false,
    isAudioReady: false,
    isStreamerDataReady: false   
}

let camData;
let audioData;
let streamInfo = [];
async function checkDataIsReadyAsync(ipfsInstance, electronWindow, streamInitializer, streamInfoGenerator) {   
    //LoadCameras and update web-view list
    
    camData = await streamInitializer.initializeCamerasAsync();
    electronWindow.webContents.send('camera-list-update', camData);  
    dataDependingFlags.isCameraReady = camData.length > 0;    
    
    audioData = await streamInitializer.initializeAudiosAsync();
    electronWindow.webContents.send('audio-list-update', audioData);
    dataDependingFlags.isAudioReady = audioData.length > 0;
    if(!streamInfoGenerator) {
        console.log("Streamer info generator not ready.");
        return false;
    }
  
    streamInfo = await streamInfoGenerator.getGeneratedStreamerInfoAsync(ipfsInstance);  
    dataDependingFlags.isStreamerDataReady = streamInfo != null;
    
    //TODO: Complete data!   
    return {
        "isDataReady" : isAllDataReady(),
        "streamInfo" : streamInfo
    }
}

function isAllDataReady() {
    console.log(`Checking is all data ready: \n 
        cameraReady:${dataDependingFlags.isCameraReady} \n 
        streamerDataReady: ${dataDependingFlags.isStreamerDataReady}`);
        
    return dataDependingFlags.isCameraReady && dataDependingFlags.isAudioReady && dataDependingFlags.isStreamerDataReady;
}

function getStreamerInfoArray() {
    return streamInfo;
}

module.exports = {
    checkDataIsReadyAsync,
    streamInfo
}