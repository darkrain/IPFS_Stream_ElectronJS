const FfmpegParserBase = require('./parserBase');

class WinDeviceParser extends FfmpegParserBase {
    constructor(ffmpegPath) {
        super(ffmpegPath);
    }
}

module.exports = WinDeviceParser;