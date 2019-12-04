const pathModule = require('path');
const getVideoInfo = require('get-video-info');
const appConfig = require('../../appFilesConfig');
const fsExtra = require('fs-extra');
const dataConverter = require('../helpers/dataConverters');

class TempStreamSaver {
    constructor(ipfsInstance) {   
        this.ipfs = ipfsInstance;
    }

    async handleStreamersArrayAsync(streamersArray) {
        let readyStreams = [];
        for(let streamerInfo of streamersArray) {
            await this.isStreamerAlreadyInitialized(streamerInfo);
            if(isInitialized === true) {
                readyStreams.push(streamerInfo);
                continue;
            }
            
        }

        return readyStreams;
    }

    async loadLastChunkOfStreamer(streamerInfo) {

        //await new Promise((resolve,))

        const encodedChunkInfo = streamerInfo.lastStreamBlockEncoded;
        const lastChunkInfo = dataConverter.convertBase64DataToObject(encodedChunkInfo);
    }

    getTempPathOfStreamer(hashOfStreamer) {
        return pathModule.join(appConfig.folders.TEMP_FOLDER, hashOfStreamer);
    }

    async downloadChunkAsync() {
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