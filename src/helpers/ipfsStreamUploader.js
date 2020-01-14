const StreamBlock = require('../data/streamBlock');
class IpfsStreamUploader {
    constructor(ipfs) {
        this.lastBlock = null;
        this.ipfs = ipfs;
    }

    getLastSteamBlock() {
        return this.lastBlock;
    }

    setPreviousBlockHash(prevBlockHash) {
        this.previousBlockHash = prevBlockHash;
    }

    getPreviousBlockHash() {
        return this.previousBlockHash;
    }

    addChunkToIpfsDAGAsync(chunkName, extInf, chunkHash) {
        const streamUpdater = this;

        let blockData = {};
        blockData.EXTINF = extInf;
        blockData.FILE_NAME = chunkName;
        blockData.VIDEO_CHUNK_HASH = chunkHash;
        let block = new StreamBlock(blockData);
        let blockJsonData = block.getBlockData();
        const prevBlockHash = this.getPreviousBlockHash();
        if(prevBlockHash !== null && prevBlockHash !== '') {
            blockJsonData.link = {
                "/" : prevBlockHash
            };
        }
        return new Promise((resolve, reject) => {
            this.ipfs.dag.put(blockJsonData, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
                if(err) {
                    console.error(`Cannot upload block data: \n ${JSON.stringify(blockJsonData)} to ipfs! \n ${err}`);
                    reject(err);
                }
                const cidEcnoded = cid.toBaseEncodedString();
                blockJsonData.dagCID = cidEcnoded;
                streamUpdater.setPreviousBlockHash(cidEcnoded);
                this.lastBlock = blockJsonData;
                resolve(blockJsonData);
              });
        });
        
    }
}

module.exports = IpfsStreamUploader;