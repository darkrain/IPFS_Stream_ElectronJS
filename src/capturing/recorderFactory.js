const LinuxRecorder = require('./ffmpegRecorders/LinuxRecorder');
const WindowsRecorder = require('./ffmpegRecorders/WindowsRecorder');
const MacRecorder = require('./ffmpegRecorders/MacRecorder');

class RecorderFactory {
    static CreateRecorderByOS(osName, ffmpegPath, outputPath) {
        switch(osName) {
            case 'WINDOWS': {
                return new WindowsRecorder(ffmpegPath, outputPath);
            }case 'LINUX': {
                return new LinuxRecorder(ffmpegPath, outputPath);
            }case 'MAC': {
                return new MacRecorder(ffmpegPath, outputPath);
            }
        }
    }
}

module.exports = RecorderFactory;