const pathModule = require('path');
const Stream = require('./stream.js');
const localServer = require('../localServer/localServer.js');
const appConfig = require('../../appFilesConfig');
const FFmpegController = require('../capturing/ffmpegController');
const logger = require('../data/logger');
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

    //crf is video qualiti from 1(best) to 51 (worst)
    setStreamQuality(quality) {
        if(this.stream) {
            this.stream.setQuaility(quality);
        }
    }

    resetStream() {
        try {
            const date = new Date();
            console.log(`Reset stream in .. ${date.getMinutes()}m ${date.getSeconds()}`);
            const videoFolderName = "videos";
            const streamName = this.generateRandomStreamName();
            console.log("Create new stream instance inside initializer..");
            this.relativeVideoPath = pathModule.join(videoFolderName, streamName);
            console.log(`RELATIVE PATH FOR VIDEO UPDATED: ${this.relativeVideoPath}`);
            this.ffmpegController = new FFmpegController();
            this.fullVideoPath = pathModule.join(this.getModuleFolderPath(videoFolderName), streamName);
            const playListPath = pathModule.join(this.fullVideoPath, 'master.m3u8');
            this.ffmpegRecorder = this.ffmpegController.getFFmpegRecorder(playListPath);
            this.stream = new Stream(this.ipfs, streamName, this.fullVideoPath, this.ffmpegRecorder);
            this.stream.createRooms();
            this.streamName = streamName;
            this.deviceParser = this.ffmpegController.getDeviceParser();
        } catch(err) {
            logger.printErr(err);
            throw err;
        }
    };  

    startStream(playListReadyCallBack, streamerInfo) {
        try {
            this.isStreamStarted = true;
            this.stream.start(playListReadyCallBack, streamerInfo);
        } catch(err) {
            logger.printErr(err);
            throw err;
        }
        
    };
    getRelativePathOfVideo() {
        return this.relativeVideoPath;
    }
    getStreamUploader() {
        return this.stream.ipfsStreamUploader;
    }
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
            logger.printErr(err);
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
            logger.printErr(err);
            throw err;
        }
    }

    setCameraByName(camName) {
        this.ffmpegRecorder.setCamera(camName);
    }

    setAudioByName(audioName) {
        this.ffmpegRecorder.setAudio(audioName);
    }
}

module.exports = StreamInitializer;
