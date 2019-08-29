const spawn = require('child_process').spawn;
const fs = require('fs');
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