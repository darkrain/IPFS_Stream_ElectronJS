const Room = require('ipfs-pubsub-room');
const dataConverter = require('../helpers/dataConverters.js');
const pathModule = require('path');
const appRootPath = require('app-root-path');
const fs = require('fs');
const localServer = require('../localServer/localServer.js');

const STREAMERS_DATA_PATH = pathModule.join(appRootPath.toString(), 'user','userData','streamers');

class StreamWatchPage {
    constructor(ipfs, ipc, win, streamerInfo){       
        this.ipfs = ipfs;
        this.ipc = ipc;
        this.win = win;
        this.streamerInfo = streamerInfo;
        this.lastBlockIndex = 0;
        
        const streamWatchPageObj = this;            
        this.initializeStreamerPath(this.streamerInfo).then((path) => {
            //DO something when path exists
            streamWatchPageObj.win.webContents.send('streamerDataGetted', streamWatchPageObj.streamerInfo);
            streamWatchPageObj.createTranslationFolder(path);
            streamWatchPageObj.subscribeToStreamerRoom(streamWatchPageObj.streamerInfo);
            localServer.startLocalServer(streamWatchPageObj.streamerVideoVideoFolder);
        }).catch((err) => {
            console.error("Cannot initialize streamer path: \n" + err.toString())
        });

        this.ipc.on('exit-watch', (event, args) => {
            localServer.stopLocalServer();
        });
    }

    initializeStreamerPath(streamerInfo) {
        const streamerHash = streamerInfo.hashOfStreamer;
        const streamPath = pathModule.join(STREAMERS_DATA_PATH, streamerHash);
        return new Promise((resolve, rejected) => {
            try{
                if(fs.existsSync(streamPath)) {
                    resolve(streamPath);
                } else {
                    rejected(new Error("Path not exists: ") + streamPath);
                }
            } catch(err) {
                rejected(err);
            }           
        });
    }

    createTranslationFolder(streamerPath) {
        this.streamerVideoVideoFolder = pathModule.join(streamerPath, 'streamChunks');
        fs.mkdirSync(this.streamerVideoFolder);
    }

    subscribeToStreamerRoom(streamerInfo) {
        const streamWatchPageObj = this;
        const streamHash = streamerInfo.hashOfStreamer;
        console.log("Subscribe to streamer room name: " + streamHash);
        this.streamerRoom = Room(this.ipfs, streamHash);
        console.log("**** Try to subscribe room with hash: " + streamHash);
        this.streamerRoom.on('subscribed', () => {
            console.log(`Subscribed to ${streamHash} room!`);
        });
        this.streamerRoom.on('message', (msg) => {
            const messageStr = msg.data.toString();
            console.log("Getted message from streamer: " + messageStr);
            streamWatchPageObj.onStreamDataGetted(messageStr);
        });
    }

    async onStreamDataGetted(streamData) {
        const streamWatchPageObj = this;
        try {
            const streamBlock = dataConverter.convertBase64DataToObject(streamData);
            const chunkHash = streamBlock.VIDEO_CHUNK_HASH;
            const extInf = streamBlock.EXTINF;
            const lastChunkData = await new Promise((resolve, rejected) => {
                streamWatchPageObj.ipfs.get(chunkHash, (err, files) => {
                    if(err) {
                        rejected(err);
                    }
                    const chunkName = 'master' + streamWatchPageObj.lastBlockIndex + '.ts';
                    const chunkPath = pathModule.join(streamWatchPageObj.streamerVideoVideoFolder, chunkName);
                    const file = files[0];
                    const buffer = file.content;
                    fs.writeFile(chunkPath,buffer, (err) => {
                        if(err) {
                            rejected(err);
                        }
                        const chunkData = {
                            fileName: chunkName,
                            extInf: extInf
                        }
                        resolve(chunkData);
                    });
                });
            });

            await this.updateM3UFile(lastChunkData);

            streamWatchPageObj.lastBlockIndex++;
        } catch(err) {
            console.error("Unable handle stream data: \n" + err.toString());
        }
    }

    async updateM3UFile(chunkData) {
        const streamWatchPageObj = this;
        const m3uPath = pathModule.join(streamWatchPageObj.streamerVideoVideoFolder, 'master.m3u8');
        try {
            await new Promise((resolve, rejected) => {                            
                if(!fs.exists(m3uPath)) {
                    const baseContent = `#EXTM3U
                        #EXT-X-VERSION:3
                        #EXT-X-TARGETDURATION:8
                        #EXT-X-MEDIA-SEQUENCE:0
                        #EXT-X-PLAYLIST-TYPE:EVENT`;
                        try{
                            fs.writeFileSync(m3uPath, baseContent);
                            resolve();
                        }catch(err) {
                            rejected(err);
                        }                                          
                } else {
                    resolve();
                }
            });
            await new Promise((resolve, rejected) => {
                const chunkName = chunkData.fileName;
                const extInf = chunkData.extInf;
                try {
                    fs.appendFileSync(m3uPath, chunkName);
                    fs.appendFileSync(m3uPath, extInf);
                    resolve();
                } catch(err) {
                    rejected(err);
                }
            });
        } catch(err) {
            console.error("Unable handle creation of m3ufile: \n" + err.toString());
        }            
    }
}

module.exports = StreamWatchPage;