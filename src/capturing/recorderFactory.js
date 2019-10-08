const LinuxRecorder = require('./ffmpegRecorders/LinuxRecorder');
const WindowsRecorder = require('./ffmpegRecorders/WindowsRecorder');
const MacRecorder = require('./ffmpegRecorders/MacRecorder');
const fs = require('fs');

class RecorderFactory {
    static CreateRecorderByOS(osName, ffmpegPath, outputPath) {
        if(!fs.existsSync(ffmpegPath))
            throw new Error(`FFMPEG NOT EXISTS IN: ${ffmpegPath}!!!`);

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