const pathModule = require('path');
const appRootPath = require('app-root-path');
const EventEmitter = require('events');
const Stream = require('./stream.js');

class OnStreamVideoRelativePathUpdatedEvent extends EventEmitter {};

class StreamInitializer {
    constructor(IPFSinstance) {               
        this.ipfs = IPFSinstance;
        //events
        this.onStreamVideoRelativePathUpdatedEvent =  new OnStreamVideoRelativePathUpdatedEvent(); 
        
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
        return pathModule.join(appRootPath.toString(), folderName).toString();
    };

    getBinFolder() {
        return this.getModuleFolderPath('bin');
    }

    resetStream() {
        const date = new Date();
        console.log(`Reset stream in .. ${date.getMinutes()}m ${date.getSeconds()}`);
        const videoFolderName = "videos";
        const binFolder = this.getBinFolder();
        const streamName = this.generateRandomStreamName(); 
        console.log("Create new stream instance inside initializer..");

        this.relativeVideoPath = '../' + videoFolderName + '/' + streamName;
        this.onStreamVideoRelativePathUpdatedEvent.emit('onVideoFolderUpdated', this.relativeVideoPath);

        this.stream = new Stream(this.ipfs, streamName, videoFolderName, binFolder);
        if(this.lastCameraName) {
            this.stream.setCameraByName(this.lastCameraName);
        }       
        else {
            console.error("Last camera name isnt saved! Next start will throws error!!!");
        }

        this.stream.createRooms();
    };  

    startStream(playListReadyCallBack) {
        try {
            this.stream.start(playListReadyCallBack);
        } catch(e) {
            console.log(`Unable to start stream! Coz \n ${e}`);
        }
        
    };

    stopStream() {
        this.stream.stop();
    };

    initializeCameras = async () => {
        let cameraName;
        const currentStream = this.stream;
        if(!currentStream) {
            console.error("Cannot initialize cameras becouse stream is NULL!")
            return [];
        }
        let dataOfCamers = [];
        await currentStream.loadCamerasAsync().then((data) => {
            dataOfCamers = data;
            console.log(`CAM DATA LOADED!\n ${typeof(data)} \n Send to web-view...`);            
            //Set camera to default at start:
            if(data.length > 0) {
              cameraName = data[0].name;
              currentStream.setCameraByName(cameraName);
            } else {
              throw new Error("NO CAMERAS!");
            }
          });
        this.lastCameraName = cameraName;
        return dataOfCamers;
    };

    setCameraByName(camName) {
        this.stream.setCameraByName(camName);
    }

    onVideoPathUpdatedWithRelativePath = (callback) => {
        callback(path);
    }

    getLastVideoRelativePath = () => {
        return this.relativeVideoPath;
    }
}

module.exports = StreamInitializer;
