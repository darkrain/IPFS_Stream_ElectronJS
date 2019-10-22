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
const hlsPlaylistManager = require('../data/hlsPlaylistManager');

class StreamWatchPage extends PageBase{
    constructor(ipfs, ipc, win, streamerInfo){  
        super();
        this.rawBlocksQueue = new Set();
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
            streamWatchPageObj.m3uPath = pathModule.join(streamWatchPageObj.streamerVideoFolder, 'master.m3u8');
            streamWatchPageObj.subscribeToStreamerRoom(streamWatchPageObj.streamerInfo);
            localServer.setStaticPath(streamWatchPageObj.streamerVideoFolder);
            streamWatchPageObj.win.webContents.send('countOfWatchers-updated', streamerInfo.streamWatchCount);
            this.handleChunksQueueLoop().then(() => {
                console.log(`Chunks Handling ENDED!`);
            });
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

        const countOfChunksToReady = 2;
        this.streamerRoom.on('message', (msg) => {
            if(!super.isEnabled()) {
                streamWatchPageObj.streamerRoom.removeAllListeners();
                return;
            }
            const messageStr = msg.data.toString();
            this.rawBlocksQueue.add(messageStr);

            if(this.lastBlockIndex >= countOfChunksToReady) { //Update front page after 2 chunks is ready
                this.initializeStartingStreamIfNotYet();
            }
            console.log("Getted message from streamer: " + messageStr);
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

    async loadChunkAsync(streamBlock) {
        const chunkHash = streamBlock.VIDEO_CHUNK_HASH;
        const extInf = streamBlock.EXTINF;
        const chunkData = {
            fileName: 'UNKNOWN_FILE',
            extInf: "UNKNOWN_EXT"
        };
        await new Promise((resolve, rejected) => {
            this.ipfs.get(chunkHash, (err, files) => {
                if(err) {
                    rejected(err);
                }
                const chunkName = 'master' + this.lastBlockIndex + '.ts';
                const chunkPath = pathModule.join(this.streamerVideoFolder, chunkName);
                const file = files[0];
                const buffer = file.content;
                fs.writeFile(chunkPath,buffer, (err) => {
                    if(err) {
                        rejected(err);
                    }
                    chunkData.fileName = chunkName;
                    chunkData.extInf = extInf;
                    resolve();
                });
            });
        });
        this.lastBlockIndex++;
        return chunkData;
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

    async handleChunksQueueLoop() {
        const delayOfHandle = 1000;
        while (super.isEnabled()) {
            if(this.rawBlocksQueue.size <= 0) {
                await this.delayAsync(delayOfHandle);
                continue;
            }
            try {
                for(let rawBlockMessage of this.rawBlocksQueue) {
                    const streamBlock = dataConverter.convertBase64DataToObject(rawBlockMessage);
                    const chunkData = await this.loadChunkAsync(streamBlock);
                    this.win.webContents.send('countOfWatchers-updated', streamBlock.streamWatchCount);

                    await hlsPlaylistManager.updateM3UFileAsync(chunkData, this.m3uPath);
                    this.rawBlocksQueue.delete(rawBlockMessage);
                }
            } catch(err) {
                console.error(`Error in handling chunks! ${err.message}`);
                await this.delayAsync(delayOfHandle);
            }
        }
    }

    delayAsync(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}

module.exports = StreamWatchPage;