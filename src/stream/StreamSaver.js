class StreamSaver {
    constructor(ipfsInstance, lastStreamBlock, streamerInfo) {

        this.ipfs = ipfsInstance;
        this.lastStreamBlock = lastStreamBlock;
        this.streamerInfo = streamerInfo;

        this.savedData = {
            streamerInfo: this.streamerInfo,
            chunksHashes: []
        };
    }

    async getAllSavedStreamData() {
        console.log(`Try to get all saved data with last blocK: \n ${JSON.stringify(this.lastStreamBlock)}`);
        this.savedData.chunksHashes = await this.downloadAllHashes();
        return this.savedData;
    }

    async downloadAllHashesByDag() {
        try {
            const lastCID = this.lastStreamBlock.dagCID;
            const result = await new Promise((resolve, rejected) => {
                this.ipfs.dag.tree(`${lastCID}`, {recursive: true}, (err, result) => {
                    if(err)
                        rejected(err);
                    resolve(result);
                });
            });
            console.log(`DAG-TREE: RESULT: \n ${JSON.stringify(result)}`);
            for(let i = 0; i < result.length; i++) {
                console.log(`VALUE: \n ${JSON.stringify(result[0])} \n type: ${typeof(result[0])}`)
            }

            let lastLink = result.link;
            const dataHashes = [];
            if(lastLink) {
                const lastHash = lastLink.VIDEO_CHUNK_HASH;
                if(lastHash) {
                    dataHashes.unshift(lastHash);
                }
            }
            while (lastLink) {
                console.log(`DAG: ITerate link: \n ${JSON.stringify(lastLink)}`);
                lastLink = lastLink.link;
                if(lastLink) {
                    const hash = lastLink.VIDEO_CHUNK_HASH;
                    if(hash) {
                        dataHashes.unshift(hash) ;
                    }
                }
            }

            return dataHashes; //TEST
        } catch(err) {
            console.error(`Cannot load all chunks hashes! Becouse: \n ${err.name} \n  ${err.message} \n ${err.stack}`);
        }
    }

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
                            console.error(`DAG: Unable to load last hash because: ${err.message}...`);
                            lastCID = null;
                            resolve(null);
                        }
                        try {
                            console.log(`DAG: child getted! Result: \n ${JSON.stringify(result)}`);
                            lastCID = result.value.link['/'];
                            resolve(result.value.VIDEO_CHUNK_HASH);
                        } catch(err) {
                            console.error(`DAG: Unable to load last hash because: ${err.message}...`);
                            lastCID = null;
                            resolve(null);
                        }
                    });
                });
                if(chunkHash !== null) {
                    hashes.unshift(chunkHash);
                } else {
                    console.log(`DAG: Chunk hash === null! Break loop!`);
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