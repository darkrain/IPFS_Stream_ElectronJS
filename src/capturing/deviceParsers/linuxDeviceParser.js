const FfmpegParserBase = require('./parserBase');
const { spawn } = require('child_process');
const deviceCommands = require('../commands').DeviceCommands.LINUX;
const fs = require('fs');
class LinuxDeviceParser extends FfmpegParserBase {
    constructor(ffmpegPath) {
       super(ffmpegPath);
       
       this.v4l2Path = `${this.osSeparator}usr${this.osSeparator}bin${this.osSeparator}v4l2-ctl`;
       if(!fs.existsSync(this.v4l2Path))
            throw new Error(`v4l2-ctl not exists in: ${this.v4l2Path}`);
    }
    async getOutputAsync(timeToWait = 1000) {
        try {
            const data = await new Promise((resolve, rejected) => {
                const vflProc = spawn(this.v4l2Path, deviceCommands);
                let chunks = '';
                vflProc.stdout.on('data', (chunk) => {
                    chunks += chunk;
                });
                vflProc.on('error', (err) => {
                    rejected(err);
                })
                setTimeout(() => {
                    vflProc.kill();
                    resolve(chunks);
                }, timeToWait);
            });
            return data;
        } catch(err) {
            throw err;
        }
    }
    async getVideoDevices() {
        const devices = [];
        const dataToParse = await this.getOutputAsync();
        const splitted = dataToParse.split('\n');
        for(let i = 0; i < splitted.length; i++) {
            const line = splitted[i];
            if(line.includes('/dev/'))
                devices.push(line.trim());
        }
        return devices;
    }
    async getAudioDevices() {
        //TODO how to specify audio for linux!?
        throw new Error("No implementation!");
    }
}

module.exports = LinuxDeviceParser;