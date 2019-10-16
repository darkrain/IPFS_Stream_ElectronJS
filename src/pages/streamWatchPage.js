const Room = require('ipfs-pubsub-room');
const dataConverter = require('../helpers/dataConverters.js');
const pathModule = require('path');
const ChatRoom = require('../data/ChatRoom');
const ChatRoomInitializer = require('../helpers/ChatRoomInitializer');
const fs = require('fs');
const localServer = require('../localServer/localServer.js');
const PageBase = require('./pageBase');
const appConfig = require('../../appFilesConfig');
const STREAMERS_DATA_PATH = pathModule.join(appConfig.folders.USER_DATA_PATH ,'streamers');
const fsExtra = require('fs-extra');

class StreamWatchPage extends PageBase{
    constructor(ipfs, ipc, win, streamerInfo){  
        super();     
        this.ipfs = ipfs;
        this.ipc = ipc;
        this.win = win;
        this.streamerInfo = streamerInfo;
        this.lastBlockIndex = 0;
        this.isStreamInitialized = false;
        const streamWatchPageObj = this;

        this.chatRoomInitializer = new ChatRoomInitializer(this.ipfs, this.ipc, this.win, this.streamerInfo);
        this.chatRoomInitializer.initialize();

        this.initializeStreamerPath(this.streamerInfo).then((path) => {
            console.log("Stream path initialized!: " + path.toString());
            //DO something when path exists
            streamWatchPageObj.win.webContents.send('streamerDataGetted', streamWatchPageObj.streamerInfo);
            streamWatchPageObj.createTranslationFolder(path);
            streamWatchPageObj.subscribeToStreamerRoom(streamWatchPageObj.streamerInfo);
            localServer.setStaticPath(streamWatchPageObj.streamerVideoFolder);
            streamWatchPageObj.win.webContents.send('countOfWatchers-updated', streamerInfo.streamWatchCount);
        }).catch((err) => {
            console.error("Cannot initialize streamer path: \n" + err.toString())
        });

        this.ipc.on('exit-watch', (event, args) => {
            //Some actions on exit watch page...
        });
        this.ipc.on('gotoGlobalPage', async (event, args) => {
            this.onExit();
            super.goToGlobalPage();
        });
    }

    onExit() {
        if(this.streamerRoom) {
            this.streamerRoom.leave().then(() => {
                console.log("LEave from room!");
            })
        }
    }

    async initializeStreamerPath(streamerInfo) {
        const streamerHash = streamerInfo.hashOfStreamer;
        const streamPath = pathModule.join(STREAMERS_DATA_PATH, streamerHash);
        const path = await new Promise((resolve, rejected) => {
            try{
                if(fs.existsSync(streamPath)) {
                    resolve(streamPath);
                } else {
                    console.error(`Path ${path} not exists!`);
                    resolve(streamPath);
                }
            } catch(err) {
                console.error(`Some error in initialize streamer path: ` + err.toString());
                resolve(streamPath);
            }           
        });

        return path;
    }

    createTranslationFolder(streamerPath) {
        this.streamerVideoFolder = pathModule.join(streamerPath, 'streamChunks');
        try{
            if(!fs.existsSync(this.streamerVideoFolder)) {
                fs.mkdirSync(this.streamerVideoFolder);
            } else {
               fsExtra.emptyDir(this.streamerVideoFolder);
            }
        } catch(err) {
            console.error("Cannot create translation folder ! Coz: \n" + err.toString());
            throw err;
        }       
    }

    subscribeToStreamerRoom(streamerInfo) {
        const streamWatchPageObj = this;
        const streamHash = streamerInfo.hashOfStreamer;
        console.log("Subscribe to streamer room name: " + streamHash);
        this.streamerRoom = Room(this.ipfs, streamHash);
        //setup streamer room
        this.streamerRoom.setMaxListeners(0);
        this.streamerRoom.removeAllListeners();
    
        console.log("**** Try to subscribe room with hash: " + streamHash);
        this.streamerRoom.on('subscribed', () => {
            console.log(`Subscribed to ${streamHash} room!`);
        });
        this.streamerRoom.on('message', (msg) => {
            if(!super.isEnabled()) {
                streamWatchPageObj.streamerRoom.removeAllListeners();
                return;
            }
            const messageStr = msg.data.toString();
            console.log("Getted message from streamer: " + messageStr);
            streamWatchPageObj.onStreamDataGetted(messageStr).then((data) => {
                console.log("Chunk created!");
                //Actions when data has get
                streamWatchPageObj.win.webContents.send('countOfWatchers-updated', data.streamBlock.streamWatchCount);
                this.updateM3UFile(data.lastChunkData).then(() => {
                    console.log(`M3U8 File updated by block!`);
                    this.initializeStartingStreamIfNotYet();
                })
            })
            .catch((err) => {
            console.error("Chunk cannot be created! ERROR!" + err.toString());
            })
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
                    const chunkPath = pathModule.join(streamWatchPageObj.streamerVideoFolder, chunkName);
                    const file = files[0];
                    const buffer = file.content;
                    fs.writeFile(chunkPath,buffer, (err) => {
                        if(err) {
                            rejected(err);
                        }
                        const chunkData = {
                            fileName: chunkName,
                            extInf: extInf
                        };
                        resolve(chunkData);
                    });
                });
            });
            streamWatchPageObj.lastBlockIndex++;
            return {streamBlock: streamBlock, lastChunkData: lastChunkData};
        } catch(err) {
            console.error("Unable handle stream data: \n" + err.message);
            throw  err;
        }
    }

    initializeStartingStreamIfNotYet() {
        if(this.isStreamInitialized === false) {
            this.onStreamInitialized();
            this.isStreamInitialized = true;
        }
    }

    onStreamInitialized() {
        this.win.webContents.send('stream-loaded');
    }

    async updateM3UFile(chunkData) {
        const streamWatchPageObj = this;
        const m3uPath = pathModule.join(streamWatchPageObj.streamerVideoFolder, 'master.m3u8');
        try {
            await new Promise((resolve, rejected) => {                            
                if(!fs.existsSync(m3uPath)) {
                    const baseContent = `#EXTM3U\r\n#EXT-X-VERSION:3\r\n#EXT-X-TARGETDURATION:8\r\n#EXT-X-MEDIA-SEQUENCE:0\r\n#EXT-X-PLAYLIST-TYPE:EVENT\r\n`;
                        try{
                            fs.appendFileSync(m3uPath, baseContent);
                            resolve();
                        }catch(err) {
                            rejected(err);
                        }                                          
                } else {
                    resolve();
                }
            });
            await new Promise((resolve, rejected) => {              
                const extInf = `#${chunkData.extInf},\r\n`;
                const chunkName = chunkData.fileName + '\r\n';
                try {
                    fs.appendFileSync(m3uPath, extInf);
                    fs.appendFileSync(m3uPath, chunkName);                  
                    resolve();
                } catch(err) {
                    rejected(err);
                }
            });
        } catch(err) {
            console.error("Unable handle creation of m3ufile: \n" + err.toString());
            throw err;
        }            
    }
    
}

module.exports = StreamWatchPage;