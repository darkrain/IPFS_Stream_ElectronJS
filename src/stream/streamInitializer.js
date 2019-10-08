const pathModule = require('path');
const Stream = require('./stream.js');
const localServer = require('../localServer/localServer.js');
const appConfig = require('../../appFilesConfig');
const FFmpegController = require('../capturing/ffmpegController');

class StreamInitializer {
    constructor(IPFSinstance) {               
        this.ipfs = IPFSinstance;
        //reset at start
        this.resetStream();     
    }

    generateRandomStreamName() {
        const date = new Date();
        const correctTime = `${date.getHours()}h${date.getMinutes()}m${date.getSeconds()}s`;
        const videoDataFolderName = "streamFrom_";

        const videoFolder = videoDataFolderName + correctTime;       
        return videoFolder;
    };

    getModuleFolderPath(folderName) {
        return appConfig.getFullPathOfFileFromSystemPath(folderName);
    };

    resetStream() {
        const date = new Date();
        console.log(`Reset stream in .. ${date.getMinutes()}m ${date.getSeconds()}`);
        const videoFolderName = "videos";
        const streamName = this.generateRandomStreamName(); 
        console.log("Create new stream instance inside initializer..");

        this.ffmpegController = new FFmpegController();
        this.fullVideoPath = pathModule.join(this.getModuleFolderPath(videoFolderName), streamName);
        const playListPath = pathModule.join(this.fullVideoPath, 'master.m3u8');
        this.ffmpegRecorder = this.ffmpegController.getFFmpegRecorder(playListPath);
        this.stream = new Stream(this.ipfs, streamName, this.fullVideoPath, this.ffmpegRecorder);
        this.stream.createRooms();  
        
        this.deviceParser = this.ffmpegController.getDeviceParser();
    };  

    startStream(playListReadyCallBack, streamerInfo) {
        try {
            this.isStreamStarted = true;
            this.stream.start(playListReadyCallBack, streamerInfo); 
            localServer.setStaticPath(this.fullVideoPath);
        } catch(e) {
            throw e;
        }
        
    };

    stopStream() {
        this.isStreamStarted = false;
        this.stream.stop();
    };

    getStreamRoomBroadcaster() {
        return this.stream.getRooomBroadcaster();
    }
    
    async initializeCamerasAsync() {
        const streamInitializerObj = this;
        let cameraName;
        const currentStream = this.stream;
        if(!currentStream) {
            console.error("Cannot initialize cameras becouse stream is NULL!")
            return [];
        }
        try {
            const dataOfCamers = await this.deviceParser.getVideoDevices();
            if(dataOfCamers.length > 0) {
                cameraName = dataOfCamers[0];
                this.setCameraByName(cameraName);
                streamInitializerObj.lastCameraName = cameraName;               
            } else {
                cameraName = 'NO CAMERA!';
                console.error("FFMPEG ERROR: No cameras!");
            }
            return dataOfCamers;
        } catch(err) {
            throw err;
        }        
    };

    async initializeAudiosAsync() {
        const streamInitializerObj = this;
        let audioName;
        const currentStream = this.stream;
        if(!currentStream) {
            console.error("Cannot initialize cameras becouse stream is NULL!")
            return [];
        }
        try {
            const dataOfAudios = await this.deviceParser.getAudioDevices();
            if(dataOfAudios.length > 0) {
                audioName = dataOfAudios[0];
                this.setAudioByName(audioName);
                streamInitializerObj.lastAudio = audioName;
            } else {
                audioName = "NO AUDIO!";
                console.error("NO AUDIOS!");
            }
            return dataOfAudios;
        } catch(err) {
            throw err;
        }
    }

    setCameraByName(camName) {
        this.ffmpegRecorder.setCamera(camName);
    }

    setAudioByName(audioName) {
        this.ffmpegRecorder.setAudio(audioName);
    }

    getLastFullVideoPath = () => {
        return this.fullVideoPath;
    }

    isStreamStarted = () => {
        return this.isStreamStarted;
    }
}

module.exports = StreamInitializer;
