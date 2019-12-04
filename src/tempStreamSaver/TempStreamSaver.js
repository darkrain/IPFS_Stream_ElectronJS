const pathModule = require('path');
const getVideoInfo = require('get-video-info');
const appConfig = require('../../appFilesConfig');

class TempStreamSaver {
    constructor() {   

    }

    async handleStreamersArrayAsync(streamersArray) {

    }

    async isStreamerAlreadyInitialized(streamerInfo) {
        
    }

    async downloadChunkASync() {
        const filePath = pathModule.join(this.keepPath, fileName);
        const videoInfo = await getVideoInfo(filePath, appConfig.files.FFPROBE);
        const videoDuration = videoInfo.format.duration;
        const chunkData = {
            EXTINF: `EXTINF:${videoDuration}`,
            FILE_NAME: fileName
        };
    }
}

module.exports = TempStreamSaver;