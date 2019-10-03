const RecorderBase = require('./recorderBase');
const RecordCommands = require('../commands').RecordCommands;

class MacRecorder extends RecorderBase {
    constructor(ffmpegPath, outputPath) {
        super(ffmpegPath, outputPath, RecordCommands.MAC);
    }
}

module.exports = MacRecorder;