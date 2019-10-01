const FfmpegParserBase = require('./parserBase');

class LinuxDeviceParser extends FfmpegParserBase {
    constructor(ffmpegPath) {
       super(ffmpegPath);
    }
}

module.exports = LinuxDeviceParser;