const FfmpegParserBase = require('./parserBase');
const parsingCommands = require('../commands').DeviceCommands.WINDOWS;

class WinDeviceParser extends FfmpegParserBase {
    constructor(ffmpegPath) {
        super(ffmpegPath);
        this.ffmpegPath = ffmpegPath;

        this.audio = null;
        this.video = null;
    }

    async parseAudioFromData(data) {
        let audioNames = [];
        const dataLines = data.split('\n');
        const audioKeyWord = "DirectShow audio devices";
        const alternativeNameKey = "Alternative name";
        const dummyExitKey = "dummy";
        let isAudioDevicesDesribed = false;

        for(let i = 0; i < dataLines.length; i++) {
            let line = dataLines[i];
            if(line.includes(dummyExitKey)) {
                break;
            }
            if (line.includes(audioKeyWord) && isAudioDevicesDesribed == false) {
                isAudioDevicesDesribed = true;
                continue;
            }
            if(isAudioDevicesDesribed && line.includes(alternativeNameKey))
                continue;
            if(isAudioDevicesDesribed) {
                const audioName = this.getAudioName(line);
                audioNames.push(audioName);
            }
        }
        console.log(`Audio names: \n ${JSON.stringify(audioNames)}`);
        return audioNames;
    }

    getAudioName(audioLine) {
        let nameOfAudio = '';
        let audioNameIndex = audioLine.indexOf("\"");
        nameOfAudio = audioLine.substring(audioNameIndex)
            .replace("\"", '')
                .replace("\"", '')
                    .replace("\r", '');
        return nameOfAudio;
    }

    async parseVideoFromData(data) {
        let camNames = [];
        const dataLines = data.split('\n');
        const videoKeyWord = "DirectShow video devices";
        const audioKeyWord = "DirectShow audio devices";
        const alternativeNameKey = "Alternative name";
        let isVideoDevicesDesribed = false;
    
        for(let i = 0; i < dataLines.length; i++) {
            let line = dataLines[i];
            if (line.includes(videoKeyWord) && isVideoDevicesDesribed == false) {
                isVideoDevicesDesribed = true;
                continue;
            }
    
            if(line.includes(audioKeyWord))
                break;
            if(isVideoDevicesDesribed && line.includes(alternativeNameKey))
                continue;
            if(isVideoDevicesDesribed) {
                const camName = this.getCamName(line);
                camNames.push(camName);
            }
        }
        console.log(`CAM NAMES: \n ${JSON.stringify(camNames)}`);
        return camNames;
    }

    getCamName(camLine) {
        let nameOfCamera = '';
        let camNameIndex = camLine.indexOf("\"");
        nameOfCamera = camLine.substring(camNameIndex)
            .replace("\"", '')
                .replace("\"", '')
                    .replace("\r", '');
        return nameOfCamera;
    }

    async getVideoDevices() {
        const dataChunks = await super.getOutputAsync(parsingCommands);
        return this.getVideoDevices(dataChunks);
    }
    async getAudioDevices() {
        const dataChunks = await super.getOutputAsync(parsingCommands);
        throw this.getAudioDevices(dataChunks);
    }
}

module.exports = WinDeviceParser;