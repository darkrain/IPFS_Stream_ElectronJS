const PageBase = require('./pageBase');
const appConfig = require('../../appFilesConfig');
const pathModule = require('path');
const fs = require('fs');
const SavedStreamsDataHandler = require('../DataHandlers/SavedStreamsDataHandler');
const localServer = require('../localServer/localServer');
class WatchSavedStreamPage extends PageBase {
    constructor(ipfs, win, recordKey) {
        super();
        this.ipfs = ipfs;
        this.win = win;
        this.recordKey = recordKey;
        this.recordPath = pathModule.join(appConfig.folders.STREAM_RECORDS_FOLDER, this.recordKey);
        this.recordsDataHandler = new SavedStreamsDataHandler();
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
        await this.createFolderForRecordAsync();

        localServer.setStaticPath(this.recordPath);

        const currentStreamData = await this.recordsDataHandler.getRecordDataByKeyAsync(this.recordKey);
        if(!currentStreamData) {
            throw new Error(`Cannot find stream data for key: ${this.recordKey}!`);
        }
        const chunkHashesArr = currentStreamData.chunksHashes;

        await this.downloadAllChunksAsync(chunkHashesArr);
    }

    async createFolderForRecordAsync() {
        const isExists = await fs.existsSync(this.recordPath);
        if(!isExists) {
            await fs.mkdirSync(this.recordPath);
        }
    }

    async downloadAllChunksAsync(chunkHashesArr, countToEmit = 2) {
        if(countToEmit <= chunkHashesArr.length) {
            const timeOut = 5000;
            //emit by timeOut
            setTimeout(() => {
                this.emitAboutChunksReady();
            }, timeOut);
        }

        for(let i = 0; i < chunkHashesArr.length; i++ ) {

        }
    }

    async createPlayListAsync() {

    }

    emitAboutChunksReady() {
        this.win.webContents.send('record-loaded');
    }
}

module.exports = WatchSavedStreamPage;