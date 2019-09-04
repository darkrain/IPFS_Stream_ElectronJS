class StreamBlock {
    constructor(blockData) {
        this.EXTINF = blockData.EXTINF;
        this.FILE_NAME = blockData.FILE_NAME;
        this.VIDEO_CHUNK_HASH = blockData.VIDEO_CHUNK_HASH;
    }

    getBlockData() {
        let blockData = {};
        blockData.EXTINF = this.EXTINF;
        blockData.FILE_NAME = this.FILE_NAME;
        blockData.VIDEO_CHUNK_HASH = this.VIDEO_CHUNK_HASH;        
        return blockData;
    }
}

module.exports = StreamBlock;