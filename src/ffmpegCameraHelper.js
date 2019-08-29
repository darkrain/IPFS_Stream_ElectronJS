const spawn = require('child_process').spawn;
const fs = require('fs');
const getCameraNamesAsync = async (ffmpegPath) => {
    let cmdData;
    await getProcessData(ffmpegPath).then(
        (data) => {
            cmdData = data;
        });
    const parsedCameraNames = await getParsedCameraNames(cmdData);  
    
    await parsedCameraNames;
}

const getParsedCameraNames = async (data) => {
    let camNames = [];
    const dataLines = data.split('\n');
    console.log("LINES LENGTH: " + dataLines.length);
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
            const camName = getCamName(line);
            camNames.push({name: camName});
        }
    }
    console.log(`CAM NAMES: \n ${JSON.stringify(camNames)}`);
    return camNames;
};

const getCamName = (camLine) => {
    let nameOfCamera = '';
    let camNameIndex = camLine.indexOf("\"");
    nameOfCamera = camLine.substring(camNameIndex)
        .replace("\"", '')
            .replace("\"", '')
                .replace("\r", '');
    return nameOfCamera;
}

const getProcessData = (ffmpegPath) => {
    return new Promise((resolve, reject) => {
        if(!fs.existsSync(ffmpegPath)){

            console.log("NO FFMPEG.EXE in path: " + ffmpegPath);
            return;
        }
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
        //Wait before all data can recieved
        const delay = 2000;       
        setTimeout(() => {
            console.log("CMD event! : " + dataChunks );
            resolve(dataChunks);
        }, delay);
    });   
}

module.exports = {
    getCameraNamesAsync
}