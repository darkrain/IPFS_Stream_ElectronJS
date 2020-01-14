class StreamSaver {
    constructor(ipfsInstance, lastStreamBlock, streamerInfo) {
        this.ipfs = ipfsInstance;
        this.lastStreamBlock = lastStreamBlock;
        this.streamerInfo = streamerInfo;
        this.savedData = {
            streamerInfo: this.streamerInfo,
            recordKey: undefined,
            chunksHashes: []
        };
    }

    async getAllSavedStreamData() {
        //get date
        const date = new Date();
        const currentDate = `${date.getDay()}_${date.getMonth()}_${date.getFullYear()}`;
        this.savedData.streamerInfo.date = currentDate;
        this.savedData.chunksHashes = await this.downloadAllHashes();
        this.savedData.recordKey = this.savedData.streamerInfo.hashOfStreamer + '_' + this.savedData.streamerInfo.date;
        return this.savedData;
    }

    //PROBLEM WITH SAVING
    async downloadAllHashes() {
        //firstable add last chunkHash
        const hashes = [];
        hashes.unshift(this.lastStreamBlock.VIDEO_CHUNK_HASH);
        try {
            let lastCID = this.lastStreamBlock.dagCID;
            while (lastCID !== null) {
                const chunkHash = await new Promise((resolve, rejected) => {
                    this.ipfs.dag.get(lastCID, (err, result) => {
                        if(err) {
                            lastCID = null;
                            resolve(null);
                        }
                        try {
                            lastCID = result.value.link['/'];
                            resolve(result.value.VIDEO_CHUNK_HASH);
                        } catch(err) {
                            lastCID = null;
                            resolve(null);
                        }
                    });
                });
                if(chunkHash !== null) {
                    hashes.unshift(chunkHash);
                }
            }
            console.log(`Stream saver has finish work.`);
        } catch(err) {
            console.error(`Cannot load all chunks hashes! Becouse: \n ${err.name} \n  ${err.message} \n ${err.stack}`);
        }

        return hashes;
    }
}

module.exports = StreamSaver;