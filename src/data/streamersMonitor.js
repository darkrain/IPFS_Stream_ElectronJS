const fs = require('fs');
const pathModule = require('path');
const appRootPath = require('app-root-path');
const appConfig = require('../../appFilesConfig');
const userDataPath = appConfig.folders.USER_DATA_PATH;
const streamersDataFilePath = pathModule.join(userDataPath.toString(), 'streamers.json');
const streamersFolderPath = pathModule.join(userDataPath.toString(), 'streamers');
const fileHandling = require('./fileHandling');

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

async function generateDataForStreamerAsync(streamerObj, ipfs) {
    //This function prepared data for frontend page (load img from ipfs and save as base64)
    const streamerHash = streamerObj.hashOfStreamer;
    console.log("Try to generate data for streamer : " + streamerHash);
    const streamerFolder = pathModule.join(streamersFolderPath.toString(), streamerHash);
    if(!fs.existsSync(streamerFolder)) {
        fs.mkdirSync(streamerFolder);
    }
    
    const streamAvaBase64 = await fileHandling.readTextFromIpfsAsync(ipfs ,streamerObj.imgAvaHash);
    const userAvaBase64 = await fileHandling.readTextFromIpfsAsync(ipfs ,streamerObj.userAvatarHash);

    const streamData = {
        streamerName: streamerObj.nameOfStream,
        hashOfStreamer: streamerHash,
        streamWatchCount: streamerObj.watchersCount,
        userName: streamerObj.userName,
        nickname: streamerObj.nickname,
        lastStreamBlockEncoded: streamerObj.lastStreamBlockEncoded,
        streamerAvaBase64: streamAvaBase64,
        userAvaBase64: userAvaBase64,
        gameData: streamerObj.gameData,
        updatedTimeStamp: streamerObj.updatedTimeStamp
    };
    
    return streamData;
}

async function getStreamersDataAsync(ipfs) {
    try{
        const currentDate = Date.now();
        const streamersList = await getListOfStreamersAsync();
        const streamersData = [];
        for(let i = 0; i < streamersList.length; i++) {
            const streamer = streamersList[i];
            console.log("Added streamer info in array: " + JSON.stringify(streamer));
            const generatedStreamerData = await generateDataForStreamerAsync(streamer, ipfs);

            if(isStreamInfoUpOfDate(generatedStreamerData, currentDate) === true)
                streamersData.push(generatedStreamerData); 
        }
        return streamersData;
    } catch(err) {
        throw err;
    }   
}

//check is streamer not old
const maxDifferenceMs = 12000; //12 seconds
function isStreamInfoUpOfDate(streamerObj, currentDate) {
    const streamerDate = streamerObj.updatedTimeStamp;
    const differenceTimeStamp = currentDate - streamerDate;
    return differenceTimeStamp < maxDifferenceMs;
}

module.exports = {
    getStreamersDataAsync,
    generateDataForStreamerAsync
};