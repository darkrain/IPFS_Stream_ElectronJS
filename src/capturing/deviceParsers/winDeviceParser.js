const FfmpegParserBase = require('./parserBase');
const parsingCommands = require('../commands').DeviceCommands.WINDOWS;
const crypto = require('crypto');

class WinDeviceParser extends FfmpegParserBase {
    constructor(ffmpegPath) {
        super(ffmpegPath);
        this.ffmpegPath = ffmpegPath;

        this.audio = null;
        this.video = null;
    }

    parseAudioFromData(data) {
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
                const audioBuffer = new Buffer(audioName);
                audioNames.push({
                    name: audioName,
                    key: audioBuffer.toString('base64')
                });
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

    parseVideoFromData(data) {
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
                const camNameBuffer = new Buffer(camName);
                camNames.push({
                    name: camName,
                    key: camNameBuffer.toString('base64')
                });
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
        try {    
            const dataChunks = await this.getOutputAsync(parsingCommands, 3000);
            this.video = this.parseVideoFromData(dataChunks); 
            return this.video;
        } catch(err) {
            throw err;
        }  
    }
    async getAudioDevices() {
        try {         
            const dataChunks = await this.getOutputAsync(parsingCommands, 3000);
            this.audio = this.parseAudioFromData(dataChunks);
            return this.audio;
        } catch(err) {
            throw err;
        }    
    }
}

module.exports = WinDeviceParser;