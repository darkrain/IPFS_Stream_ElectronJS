const pathModule = require('path');
const appRootPath = require('app-root-path');
const fs = require('fs');
const streamerAvaFileName = 'streamerIMG.jpg';
const STREAMERS_PATH = pathModule.join(appRootPath.toString(), 'user', 'userData', 'streamers');

class StreamerDataSaver {
    constructor(ipfs) {
        this.ipfs = ipfs;
    }
    saveStreamerData(streamerInfoObj) {
        const streamerFolderPath = pathModule.join(STREAMERS_PATH, streamerInfoObj.hashOfStreamer);
        this.createFolderForStreamIfNotExists(STREAMERS_PATH);
        this.createFolderForStreamIfNotExists(streamerFolderPath);
        this.saveStreamerAva(streamerInfoObj.imgAvaHash, streamerFolderPath).then((savedPath) => {
            console.log("Streamer ava saved! At path: " + savedPath.toString());
        }).catch((err) => {

        });

    }
    createFolderForStreamIfNotExists(folderPath) {
        if(!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }     
    }
    async saveStreamerAva(avaIpfsHash, streamerPath) {
        const streamerSaverObj = this;
        try {
            await new Promise((resolve, rejected) => {
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
        }
        catch(err) {
            console.error("Cannot save streamer img to file! Coz: \n" + err.toString());
        }
    } 
}



module.exports = StreamerDataSaver;