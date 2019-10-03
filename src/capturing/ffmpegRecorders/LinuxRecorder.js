const RecorderBase = require('./recorderBase');
const RecordCommands = require('../commands').RecordCommands;

class LinuxRecorder extends RecorderBase {
    constructor(ffmpegPath, outputPath) {
        super(ffmpegPath, outputPath, RecordCommands.LINUX);
    }

    setAudio(audioName) {
        //Nothing to do in linux! Mb in future...
    }
}

module.exports = LinuxRecorder;