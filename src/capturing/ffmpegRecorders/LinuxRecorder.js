const RecorderBase = require('./recorderBase');
const RecordCommands = require('../commands').RecordCommands;

class LinuxRecorder extends RecorderBase {
    constructor(ffmpegPath, outputPath) {
        super(ffmpegPath, outputPath, RecordCommands.LINUX);
    }
}

module.exports = LinuxRecorder;