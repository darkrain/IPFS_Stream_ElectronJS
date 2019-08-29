const spawn = require('child_process').spawn;
const fs = require('fs');
const fsPath = require('path');

const getCameraNamesAsync = async (ffmpegPath) => {
    let cmdData;
    await getProcessData(ffmpegPath).then(
        (data) => {
            console.log("Try to get data from cmd...");
            cmdData = data;
        });
    console.log("DATA GETTED: " + cmdData)
    const parsedCameraNames = await getParsedCameraNames(cmdData);  
    
    await parsedCameraNames;
}

const getParsedCameraNames = async (data) => {
    const lines = data.split('\n');
    console.log("LINES: " + lines.length);
    return lines;
};

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
    
        ffmpegListCameras
            .stderr
            .once('data', (chunk) => {
                const data = chunk.toString();
                console.log("CMD event! : " + data );
                resolve(data);	
            });
    });   
}

const ffmpegBinPath = fsPath.join(__dirname.replace('src','bin'), 'ffmpeg.exe');
getCameraNamesAsync(ffmpegBinPath);

module.exports = {
    getCameraNamesAsync
}