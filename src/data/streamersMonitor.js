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
    console.log("Try to generate data for streamer : " + JSON.stringify(streamerObj));
    const streamerFolder = pathModule.join(streamersFolderPath.toString(), streamerHash);
    if(!fs.existsSync(streamerFolder)) {
        fs.mkdirSync(streamerFolder);
    }
    
    const streamAvaBase64 = await fileHandling.readFileFromIpfsAsBase64Async(ipfs ,streamerObj.imgAvaHash);
    const userAvaBase64 = await fileHandling.readFileFromIpfsAsBase64Async(ipfs ,streamerObj.userAvatarHash);

    const streamData = {
        streamerName: streamerObj.nameOfStream,
        hashOfStreamer: streamerHash,
        streamerAvaBase64: streamAvaBase64,
        userAvaBase64: userAvaBase64,
        streamWatchCount: streamerObj.streamWatchCount
    };
    
    return streamData;
}

async function getStreamersDataAsync(ipfs) {
    try{
        const streamersList = await getListOfStreamersAsync();
        const streamersData = [];
        for(let i = 0; i < streamersList.length; i++) {
            const streamer = streamersList[i];
            console.log("Added streamer info in array: " + JSON.stringify(streamer));
            const generatedStreamerData = await generateDataForStreamerAsync(streamer, ipfs);
            streamersData.push(generatedStreamerData); 
        }
        return streamersData;
    } catch(err) {
        throw err;
    }   
}

module.exports = {
    getStreamersDataAsync
}