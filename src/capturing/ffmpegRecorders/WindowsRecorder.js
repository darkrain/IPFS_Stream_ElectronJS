const RecorderBase = require('./recorderBase');
const RecordCommands = require('../commands').RecordCommands;

class WindowsRecorder extends RecorderBase {
    constructor(ffmpegPath, outputPath) {
        super(ffmpegPath, outputPath, RecordCommands.WINDOWS);
    }
}

module.exports = WindowsRecorder;