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
        if(this.checkAboutObsCamera())
            return;

        if(~index) { //if z >= 0
            this.commandsToRun[index] = 'video=' + '"' + this.camera + '"' + ':' + 'audio='+'"'+this.audio+'"';
        } else {     
            const msg = `unable change camera on run! \n cam: ${this.camera} \n audio: ${this.audio}`;
            throw new Error(msg);
        }
    }

    //Really bad design!
    checkAboutObsCamera() {
        const isObs = this.camera.includes('OBS');
        if(this.audio.includes('OBS'))
            this.audio = null;
        else {
            return false;
        }
        if(this.audio === null)
            this.audio = '';
        else {
            const audioBuild = ':' + 'audio='+'"'+this.audio+'"';
            this.audio = audioBuild;
        }
        if(isObs) {
            this.commandsToRun = [
                '-f' , 'dshow',
                '-i', 'video=' + '"' + this.camera + '"' + this.audio,
                '-video_size', '752x452', //set profile to support 4:2:2 resolution
                '-vcodec', 'libx264',
                '-preset','ultrafast',
                '-profile:v', 'high422',
                '-level', '3.0',
                '-c:v','libx264',
                '-crf', '30',
                '-tune','zerolatency',
                '-r', '10',
                '-async', '1',
                '-bsf:v', 'h264_mp4toannexb',
                '-maxrate', '750k',
                '-f', 'hls',
                '-hls_list_size', '1000000',
                '-hls_time', '8',
                '-hls_playlist_type', 'event',
            ];
            this.commandsToRun.push(this.outputPath);
            return true;
        }

        return false;
    }
}

module.exports = WindowsRecorder;