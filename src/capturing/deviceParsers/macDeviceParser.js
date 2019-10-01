const FfmpegParserBase = require('./parserBase');

class MacDeviceParser extends FfmpegParserBase {
    constructor(ffmpegPath) {
        super(ffmpegPath);
    }
}

module.exports = MacDeviceParser;