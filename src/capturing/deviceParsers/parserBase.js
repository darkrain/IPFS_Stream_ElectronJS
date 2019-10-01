const fs = require('fs');

class FfmpegParserBase {
    constructor(ffmpegPath) {
        this.ffmpegPath = ffmpegPath;FfmpegParserBase
        if(!fs.existsSync(this.ffmpegPath))
            console.error("Device parser: FFMPEG not exists in: "+ this.ffmpegPath);
    }
    getVideoDevices() {
        throw new Error("No implementation!");
    }
    getAudioDevices() {
        throw new Error("No implementation!");
    }
}

module.exports = FfmpegParserBase;