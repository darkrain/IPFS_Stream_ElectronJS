const fs = require('fs');
const pathModule = require('path');
const appRootPath = require('app-root-path');
const appConfig = require('../../appFilesConfig');
const userDataPath = appConfig.folders.USER_DATA_PATH;
const streamersDataFilePath = pathModule.join(userDataPath.toString(), 'streamers.json');
const streamersFolderPath = pathModule.join(userDataPath.toString(), 'streamers');

async function getListOfStreamersAsync() {
    try {
        const streamers = await new Promise((resolve, rejected) => {
            fs.readFile(streamersDataFilePath, (err, data) => {
                if(err) {
                    rejected(err);
                }
                try {
                    const streamersData = JSON.parse(data);
                    console.log("Getted streamers array with data \n: " + data);
                    console.log("Parsed data: \n" + JSON.stringify(streamersData));
                    resolve(streamersData);
                } catch(exErr) {
                    rejected(exErr);
                }
            })
        });
        
        return streamers;
    } catch(err) {
        console.error("Cannot get list of streamers! Coz: \n" + err.toString());
        return [];
    }   
}

async function generateDataForStreamerAsync(streamerObj) {
    const streamAvaName = 'streamerIMG.jpg';
    const streamUserAvaName = 'streamerUserAva.jpg';
    const streamerHash = streamerObj.hashOfStreamer;
    console.log("Try to generate data for streamer : " + streamerHash);
    const streamerFolder = pathModule.join(streamersFolderPath.toString(), streamerHash);
    if(!fs.existsSync(streamerFolder)) {
        throw new Error(`Folder for stremaer ${streamerFolder} not exists !`);
    }
    const streamerImgPath = pathModule.join(streamerFolder, streamAvaName);
    if(!fs.existsSync(streamerImgPath)) {
        throw new Error(`Stream Avatar image for stremaer ${streamerImgPath} not exists !`);
    } 
    const streamerUserAvaImgPath = pathModule.join(streamerFolder, streamUserAvaName);
    if(!fs.existsSync(streamerUserAvaImgPath)) {
        throw new Error(`USER Avatar image for stremaer ${streamerUserAvaImgPath} not exists !`);
    } 
    
    //relative path for stream ava
    const relativePath = '../../user/userData/streamers/' + streamerHash + '/' + streamAvaName; //stream avatar path
    const relativeAvaPath = '../../user/userData/streamers/' + streamerHash + '/' + streamUserAvaName; //streamer user avatar path
    const streamData = {
        streamerName: streamerObj.nameOfStream,
        streamerImage: streamerImgPath,
        relativePath: relativePath,
        hashOfStreamer: streamerHash,
        relativeUserAvaPath: relativeAvaPath
    };
    
    return streamData;
}

async function getStreamersDataAsync() {
    const streamersList = await getListOfStreamersAsync();
    const streamersData = [];
    for(let i = 0; i < streamersList.length; i++) {
        const streamer = streamersList[i];
        console.log("Added streamer info in array: " + JSON.stringify(streamer));
        const generatedStreamerData = await generateDataForStreamerAsync(streamer);
        streamersData.push(generatedStreamerData); 

    }

    return streamersData;
}

module.exports = {
    getStreamersDataAsync
}