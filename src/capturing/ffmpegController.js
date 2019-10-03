const currentOs = require('../helpers/OSDetecting').getOs();
const DeviceParserFactory = require('./deviceParserFactory');
const RecorderFactory = require('./recorderFactory');
const appConfig = require('../../appFilesConfig');
class FFmpegController {
    constructor() {
        this.ffmpegPath = appConfig.files.FFMPEG;
    }

    getDeviceParser() {
        return DeviceParserFactory.CreateParserByOS(currentOs, this.ffmpegPath);
    }

    getFFmpegRecorder(outputPath) {
        return RecorderFactory.CreateRecorderByOS(currentOs, this.ffmpegPath, outputPath);
    }
}

module.exports = FFmpegController;