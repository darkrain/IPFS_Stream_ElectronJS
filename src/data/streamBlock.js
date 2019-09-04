class StreamBlock {
    constructor(blockData, previousBlock) {
        this.EXTINF = blockData.EXTINF;
        this.FILE_NAME = blockData.FILE_NAME;
        this.VIDEO_CHUNK_HASH = blockData.VIDEO_CHUNK_HASH;
        if(previousBlock)
            this.PREVIOUS_BLOCK = blockData.PREVIOUS_BLOCK;
    }

    getBlockData() {
        let link = {};
        let blockData = {};
        blockData.EXTINF = this.EXTINF;
        blockData.FILE_NAME = this.FILE_NAME;
        blockData.VIDEO_CHUNK_HASH = this.VIDEO_CHUNK_HASH;
        if(this.PREVIOUS_BLOCK) {
            link = {
                "/": this.PREVIOUS_BLOCK
            };
            blockData.link = link;
        }
        
        return blockData;
    }
}