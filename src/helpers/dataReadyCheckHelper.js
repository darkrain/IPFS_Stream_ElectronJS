class DataReadyCheckHelper {
    constructor() {
        this.dataDependingFlags = {
            isCameraReady: false,
            isAudioReady: false,
            isStreamerDataReady: false   
        }
        this.camData = null;
        this.audioData = null;
        this.streamInfo = null;
    }
    async checkDataIsReadyAsync(ipfsInstance, electronWindow, streamInitializer, streamInfoGenerator) {   
        //LoadCameras and audio 
        if(this.dataDependingFlags.isCameraReady === false) {
            this.camData = await streamInitializer.initializeCamerasAsync();
            electronWindow.webContents.send('camera-list-update', this.camData);  
            this.dataDependingFlags.isCameraReady = this.camData && this.camData.length > 0;   
        } 
    
        if(this.dataDependingFlags.isAudioReady === false) {
            this.audioData = await streamInitializer.initializeAudiosAsync();
            electronWindow.webContents.send('audio-list-update', this.audioData);
            this.dataDependingFlags.isAudioReady = this.audioData && this.audioData.length > 0;
        }
        
        if(!streamInfoGenerator) {
            console.log("Streamer info generator not ready.");
            return false;
        }
      
        this.streamInfo = await streamInfoGenerator.getGeneratedStreamerInfoAsync(ipfsInstance);  
        this.dataDependingFlags.isStreamerDataReady = this.streamInfo != null;
        
        //TODO: Complete data!   
        return {
            "isDataReady" : this.isAllDataReady(),
            "streamInfo" : this.streamInfo
        }
    }
    
    isAllDataReady() {
        console.log(`Checking is all data ready: \n 
            cameraReady:${this.dataDependingFlags.isCameraReady} \n 
            streamerDataReady: ${this.dataDependingFlags.isStreamerDataReady}`);
            
        return this.dataDependingFlags.isCameraReady && 
                    this.dataDependingFlags.isAudioReady && 
                        this.dataDependingFlags.isStreamerDataReady;
    }
}

module.exports = DataReadyCheckHelper;