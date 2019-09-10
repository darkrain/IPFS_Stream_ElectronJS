const Room = require('ipfs-pubsub-room');
const dataConverter = require('../helpers/dataConverters.js');
const pathModule = require('path');
const appRootPath = require('app-root-path');
const fs = require('fs');

const STREAMERS_DATA_PATH = pathModule.join(appRootPath.toString(), 'user','userData','streamers');

class StreamWatchPage {
    constructor(ipfs, ipc, win, streamerInfo){
        this.ipfs = ipfs;
        this.ipc = ipc;
        this.win = win;
        this.streamerInfo = streamerInfo;    
        const streamWatchPageObj = this;
             
        this.subscribeToStreamerRoom(this.streamerInfo);      
        this.initializeStreamerPath(this.streamerInfo).then((path) => {
            //DO something when path exists
            streamWatchPageObj.win.webContents.send('streamerDataGetted', this.streamerInfo);
            streamWatchPageObj.createTranslationFolder(path);
        }).catch((err) => {
            throw err;
        })
    }

    initializeStreamerPath(streamerInfo) {
        const streamWatchObj = this;
        const streamerHash = streamerInfo.hashOfStreamer;
        this.currentStreamerPath = pathModule.join(STREAMERS_DATA_PATH, streamerHash);
        return new Promise((resolve, rejected) => {
            if(fs.existsSync(streamWatchObj.currentStreamerPath)) {
                resolve(streamWatchObj.currentStreamerPath);
            } else {
                rejected(new Error("Path not exists: ") + streamWatchObj.currentStreamerPath);
            }
        });
    }

    createTranslationFolder(streamerPath) {
        this.streamerVideoFolder = pathModule.join(streamerPath, 'streamChunks');
        fs.mkdirSync(this.streamerVideoFolder);
    }

    subscribeToStreamerRoom(streamerInfo) {
        const streamHash = streamerInfo.hashOfStreamer;
        console.log("Subscribe to streamer room name: " + streamHash);
        this.streamerRoom = Room(this.ipfs, streamHash);

        this.streamerRoom.on('subscribed', () => {
            console.log(`Subscribed to ${streamHash} room!`);
        });
        this.streamerRoom.on('message', (msg) => {
            const messageStr = msg.data.toString();
            console.log("Getted message from streamer: " + messageStr);
        });
    }
}

module.exports = StreamWatchPage;