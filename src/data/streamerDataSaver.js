const pathModule = require('path');
const appRootPath = require('app-root-path');
const fs = require('fs');
const streamerAvaFileName = 'streamerIMG.jpg';
const streamUserAvaFileName = 'streamerUserAva.jpg';
const STREAMERS_PATH = pathModule.join(appRootPath.toString(), 'user', 'userData', 'streamers');

class StreamerDataSaver {
    constructor(ipfs) {
        this.ipfs = ipfs;
    }
    async saveStreamerDataAsync(streamerInfoObj) {
        const streamerFolderPath = pathModule.join(STREAMERS_PATH, streamerInfoObj.hashOfStreamer);
        this.createFolderForStreamIfNotExists(STREAMERS_PATH);
        this.createFolderForStreamIfNotExists(streamerFolderPath);
        //stream page avatar
        const savedStreamAvaPath = await this.saveImageFromStream(streamerInfoObj.imgAvaHash, streamerFolderPath, streamerAvaFileName);
        //streamer user avatar
        const savedUserAvaPath = await this.saveImageFromStream(streamerInfoObj.userAvatarHash, streamerFolderPath, streamUserAvaFileName);
        console.log("Streamer ava saved! At path: " + savedUserAvaPath.toString());
        return {
            streamAvaPath: savedStreamAvaPath,
            userAvaPath: savedUserAvaPath
        };

    }
    createFolderForStreamIfNotExists(folderPath) {
        if(!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }     
    }
    async saveImageFromStream(avaIpfsHash, streamerPath, imgName) {
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
                    const pathToSaveFile = pathModule.join(streamerPath, imgName);
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