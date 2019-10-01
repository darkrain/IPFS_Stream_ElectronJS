const spawn = require('child_process').spawn;
const fs = require('fs');
const getAudioNamesAsync = async (ffmpegPath) => {
    let cmdData = '';
    try {
        cmdData = await getProcessData(ffmpegPath);    
    } catch(err) {
        throw err;
    }
       
    const parsedAudioNames = await getParsedAudioNames(cmdData);
    return parsedAudioNames;
}

const getParsedAudioNames = async (data) => {
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
            const audioName = getAudioName(line);
            audioNames.push({name: audioName});
        }
    }
    console.log(`Audio names: \n ${JSON.stringify(audioNames)}`);
    return audioNames;
};

const getAudioName = (audioLine) => {
    let nameOfAudio = '';
    let audioNameIndex = audioLine.indexOf("\"");
    nameOfAudio = audioLine.substring(audioNameIndex)
        .replace("\"", '')
            .replace("\"", '')
                .replace("\r", '');
    return nameOfAudio;
}

const getProcessData = (ffmpegPath) => {
    return new Promise((resolve, reject) => {
        if(!fs.existsSync(ffmpegPath)){

            reject(new Error("NO FFMPEG.EXE in path: " + ffmpegPath));
        }
        try {
            let ffmpegListCameras = spawn(ffmpegPath, 
                [
                    '-list_devices', 'true',
                    '-f', 'dshow',
                    '-i', 'dummy'	
                ]);

            let dataChunks;
            ffmpegListCameras
                .stderr
                .on('data', (chunk) => {
                    dataChunks += chunk.toString();               
                });
            ffmpegListCameras.on('error', (err) => {
                throw err;
            });
            //Wait before all data can recieved
            const delay = 2000;       
            setTimeout(() => {
                ffmpegListCameras.kill();
                resolve(dataChunks);
            }, delay);
        } catch(err) {
            throw err;
        }
    });   
}

module.exports = {
    getAudioNamesAsync
}