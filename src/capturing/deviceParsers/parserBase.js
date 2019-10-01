const fs = require('fs');
const { spawn } = require('child_process');
const pathModule = require('path');
class FfmpegParserBase {
    constructor(ffmpegPath) {
        this.ffmpegPath = ffmpegPath;
        if(!fs.existsSync(this.ffmpegPath))
            console.error("Device parser: FFMPEG not exists in: "+ this.ffmpegPath);
        this.osSeparator = pathModule.sep;
    }
    async getVideoDevices() {
        throw new Error("No implementation!");
    }
    async getAudioDevices() {
        throw new Error("No implementation!");
    }
    async getOutputAsync(commands, timeToWait = 2000) {
        try {
            console.log(`Try get output from ffmpeg by commands: ${commands}`);
            const data = await new Promise((resolve, rejected) => {
                try {
                    let dataChunks = '';
                    this.ffmpegProc = spawn(this.ffmpegPath, commands);
                    this.ffmpegProc.stderr.on('data', (chunk) => {
                        dataChunks += chunk.toString();
                    });
                    setTimeout(() => {
                        this.ffmpegProc.kill();
                        resolve(dataChunks);
                    }, timeToWait);
                } catch(err) {
                    rejected(err);
                }
            });
    
            return data; 
        } catch(err) {
            throw err;
        } 
    }
}

module.exports = FfmpegParserBase;