const execFile = require('child_process').execFile;
const KEYS = require('../commands').KEYS;
class RecorderBase {
    constructor(ffmpegPath, outputPath, commandsToRun) {
        this.ffmpegPath = ffmpegPath;
        this.outputPath = outputPath;
        this.commandsToRun = commandsToRun;

        //add output path as last args
        this.commandsToRun.push(this.outputPath);

        this.spawnOptions = {
            windowsVerbatimArguments: true
        };

        this.cameraCommand = null;
    }

    setCamera(camName) {
        //find camera key and change it
        const index = this.commandsToRun.indexOf(KEYS.CAM_KEY);
        if(~index) { //if z >= 0
            this.commandsToRun[index] = camName.trim();
            this.cameraCommand = camName;
            console.log(`Camera changed to: ${this.cameraCommand}!`);
        }
    }
    setAudio(audioName) {
        //TODO Implement audio logic for FFMPEG
        throw new Error(`not implemented!`);
    } 

    startRecord() {
        if(this.cameraCommand === null)
            throw new Error("No camera!");
        try {
            console.log(`Try to execute FFMPEG recorder with commands: \n ${this.commandsToRun}`);
            const ffmpegProc = execFile(this.ffmpegPath, this.commandsToRun, this.spawnOptions); 
            return ffmpegProc;
        } catch(err) {
            throw err;
        }
    }
}

module.exports = RecorderBase;