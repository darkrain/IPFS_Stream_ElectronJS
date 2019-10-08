const WinDeviceParser = require('./deviceParsers/winDeviceParser');
const MacDeviceParser = require('./deviceParsers/macDeviceParser');
const LinuxDeviceParser = require('./deviceParsers/linuxDeviceParser');

class DeviceParserFactory {
    static CreateParserByOS(osName, ffmpegPath) {
        switch(osName) {
            case 'WINDOWS': {
                return new WinDeviceParser(ffmpegPath);
            }case 'LINUX': {
                return new LinuxDeviceParser(ffmpegPath);
            }case 'MAC': {
                return new MacDeviceParser(ffmpegPath);
            }
        }
    }
}

module.exports = DeviceParserFactory;
