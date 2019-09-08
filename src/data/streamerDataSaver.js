const pathModule = require('path');
const appRootPath = require('app-root-path');
const fs = require('fs');
const streamerAvaFileName = 'streamerIMG.jpg';
const STREAMERS_PATH = pathModule.join(appRootPath.toString(), 'user', 'userData', 'streamers');

class StreamerDataSaver {
    constructor(ipfs) {
        this.ipfs = ipfs;
    }
    async saveStreamerDataAsync(streamerInfoObj) {
        const streamerFolderPath = pathModule.join(STREAMERS_PATH, streamerInfoObj.hashOfStreamer);
        this.createFolderForStreamIfNotExists(STREAMERS_PATH);
        this.createFolderForStreamIfNotExists(streamerFolderPath);
        const savedPath = await this.saveStreamerAvaAsync(streamerInfoObj.imgAvaHash, streamerFolderPath);
        console.log("Streamer ava saved! At path: " + savedPath.toString());
        return savedPath;

    }
    createFolderForStreamIfNotExists(folderPath) {
        if(!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }     
    }
    async saveStreamerAvaAsync(avaIpfsHash, streamerPath) {
        const streamerSaverObj = this;
        try {
            const avaPath = await new Promise((resolve, rejected) => {
                streamerSaverObj.ipfs.get(avaIpfsHash, (err, files) => {
                    if(err) {
                        rejected(err);
                    }
                    const file = files[0];
                    const buffer = file.content;

                    console.log("getted file from IPFS: \n" + file.path);
                    const pathToSaveFile = pathModule.join(streamerPath, streamerAvaFileName);
                    fs.writeFile(pathToSaveFile, buffer, (err) => {
                        if(err) {
                            rejected(err);
                        }
                        resolve(pathToSaveFile);
                    });
                });
            });

            return avaPath;
        }
        catch(err) {
            console.error("Cannot save streamer img to file! Coz: \n" + err.toString());
            return '';
        }
    } 
}



module.exports = StreamerDataSaver;