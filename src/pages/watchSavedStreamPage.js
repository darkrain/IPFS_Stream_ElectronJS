const PageBase = require('./pageBase');
const appConfig = require('../../appFilesConfig');
const pathModule = require('path');
const fs = require('fs');
const SavedStreamsDataHandler = require('../DataHandlers/SavedStreamsDataHandler');
const localServer = require('../localServer/localServer');
const hlsPlaylistManager = require('../data/hlsPlaylistManager');
const getVideoInfo = require('get-video-info');

class WatchSavedStreamPage extends PageBase {
    constructor(ipc,ipfs, win, recordKey) {
        super();
        this.ipc = ipc;
        this.ipfs = ipfs;
        this.win = win;
        this.recordKey = recordKey;
        this.recordPath = pathModule.join(appConfig.folders.STREAM_RECORDS_FOLDER, this.recordKey);
        this.m3uPath = pathModule.join(this.recordPath, 'master.m3u8');
        this.recordsDataHandler = new SavedStreamsDataHandler();
        this.ipc.on('gotoGlobalPage', async (event, args) => {
            super.goToGlobalPage();
        });
        console.log(`Record page loaded with key: ${this.recordKey}`);
        this.initializeRecordAsync()
            .then(() => {
                console.log(`Stream already initialized!`);
            })
            .catch(err => {
                throw err;
            });
    }

    async initializeRecordAsync() {
        try {
            await this.createFolderForRecordAsync();

            localServer.setStaticPath(this.recordPath);

            const currentStreamData = await this.recordsDataHandler.getRecordDataByKeyAsync(this.recordKey);
            if(!currentStreamData) {
                throw new Error(`Cannot find stream data for key: ${this.recordKey}!`);
            }
            const chunkHashesArr = currentStreamData.chunksHashes;

            await this.downloadAllChunksAsync(chunkHashesArr);
        } catch(err) {
            throw err;
        }
    }

    async createFolderForRecordAsync() {
        const isExists = await fs.existsSync(this.recordPath);
        if(!isExists) {
            await fs.mkdirSync(this.recordPath);
        }
    }

    async downloadAllChunksAsync(chunkHashesArr, countToEmit = 1) {
        if(countToEmit <= chunkHashesArr.length) {
            const timeOut = 5000;
            //emit by timeOut
            setTimeout(() => {
                this.emitAboutChunksReady();
            }, timeOut);
        }

        for(let i = 0; i < chunkHashesArr.length; i++ ) {
            try {
                const hash = chunkHashesArr[i];
                const chunkInfo = await this.downloadVideoChunkAsync(hash, i);
                if(chunkInfo !== null) {
                    await hlsPlaylistManager.updateM3UFileAsync(chunkInfo, this.m3uPath);
                }
                if(i === countToEmit) {
                    console.log(`Chunk #${i} has been loaded!`);
                    this.emitAboutChunksReady();
                }
            } catch(err) {
                throw err;
            }
        }
        await hlsPlaylistManager.appendEndToPlaylistAsync(this.m3uPath);
    }

    async downloadVideoChunkAsync(chunkHash, index) {
        const chunkName = `master${index}.ts`;
        const chunkPath = pathModule.join(this.recordPath, chunkName);
        if(fs.existsSync(chunkPath)) {
            return null;
        }
        try {
             await new Promise((resolve, rejected) => {
                this.ipfs.get(chunkHash, (err, files) => {
                    if(err) {
                        rejected(err);
                    }
                    const file = files[0];
                    const buffer = file.content;
                    fs.writeFile(chunkPath,buffer,  (err) => {
                        if(err) {
                            rejected(err);
                        }

                        resolve();
                    });
                });
            });

            const chunkVideoInfo = await getVideoInfo(chunkPath);
            const chunkInfo = {
                fileName: chunkName,
                extInf: `EXTINF:${chunkVideoInfo.format.duration}`
            };

            return chunkInfo;

        } catch(err) {
            throw err;
        }
    }

    emitAboutChunksReady() {
        console.log(`Emit about chunks updated!`);
        this.win.webContents.send('record-loaded');
    }
}

module.exports = WatchSavedStreamPage;