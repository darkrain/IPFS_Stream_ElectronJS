class RecorderBase {
    constructor(ffmpegPath, outputPath) {
        this.ffmpegPath = ffmpegPath;
        this.outputPath = outputPath;
    }
}

module.exports = RecorderBase;