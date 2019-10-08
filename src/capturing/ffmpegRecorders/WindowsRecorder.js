const RecorderBase = require('./recorderBase');
const RecordCommands = require('../commands').RecordCommands;

class WindowsRecorder extends RecorderBase {
    constructor(ffmpegPath, outputPath) {
        super(ffmpegPath, outputPath, RecordCommands.WINDOWS);
    }

    setCamera(camName) {   
        this.camera = camName;
        console.log(`Camera changed to: ${this.cameraCommand}!`);
    }

    setAudio(audioName) {
        //TODO Implement audio logic for FFMPEG
        this.audio = audioName;
        console.log("Audio changed to: " + this.audio);
    } 

    changeCameraBeforeRun() {
        //find camera key and change it
        const index = this.commandsToRun.indexOf(this.keys.CAM_KEY);
        if(~index) { //if z >= 0
            this.commandsToRun[index] = 'video=' + '"' + this.camera + '"' + ':' + 'audio='+'"'+this.audio+'"';
        } else {     
            const msg = `unable change camera on run! \n cam: ${this.camera} \n audio: ${this.audio}`;
            throw new Error(msg);
        }
    }
}

module.exports = WindowsRecorder;