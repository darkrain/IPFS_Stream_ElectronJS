const crypto = require('crypto');
const appConfig = require('../../appFilesConfig');
const errorDialog = require('../helpers/dialogErrorHelper');
const pathModule = require('path');
class StreamerInfoGenerator {
    constructor(ipfsNodeID, streamerName, streamerImg) {    
        this.nodeID = ipfsNodeID;
        this.streamerName = streamerName;
        this.streamerImgPath = streamerImg;     
    }

    async getGeneratedStreamerInfoAsync(ipfsInstance) {
        const nameData = this.nodeID + this.streamerName;
        this.streamDataHash = crypto.createHash('md5').update(nameData).digest("hex");
        const streamerImgPath = this.streamerImgPath;
        let streamerInfo = {};

        //try to upload userAva
        let userAvaHash = null;
        try {
            const userInfoObject = await appConfig.getParsedDataByPath(appConfig.files.USERINFO_JSON_PATH);
            const userAvaPath = pathModule.join(appConfig.folders.USER_PAGE, userInfoObject.photoPath);
            userAvaHash = await new Promise((resolve, rejected) => {
                //upload userAvatar image
                ipfsInstance.addFromFs(userAvaPath, {}, (err, result) => {
                    if(err) 
                        throw err;
                    const hash = result[0].hash;
                    console.log("User ava hash has been uploaded! \n hash:" + hash);
                    resolve(hash);      
                });
            });
        } catch (err) {
            errorDialog.showErorDialog('StreamerInfoGenerator', `Cannot upload user avatar in ipfs! \n ${err.message} \n${err.stack}`, true);
        }
        //try upload streamPageAva
        const AVA_IMG_NOHASH_ERR_KEY = "NOTHING";
        let avaHashInfo = await new Promise((resolve, rejected) => {
            //upload streamPage image
            ipfsInstance.addFromFs(streamerImgPath, { }, (err, result) => {
                if (err) { 
                    errorDialog.showErorDialog('StreamerInfoGenerator', `cannot add stream view image in ipfs! \n ${err.message} \n ${err.stack}`, true);
                    rejected(err);
                }

                console.log("Result of uploading img: \n" + JSON.stringify(result));
                resolve(result);
            });
        }); 
        if(!avaHashInfo || avaHashInfo === AVA_IMG_NOHASH_ERR_KEY) {
            console.error("AVA HASH INFO IS " + AVA_IMG_NOHASH_ERR_KEY + "! Try again.");
            return null;
        }
        const uploadedAvaHash = avaHashInfo[0].hash;

        streamerInfo.nameOfStream = this.streamerName;
        streamerInfo.hashOfStreamer = this.streamDataHash;
        streamerInfo.imgAvaHash = uploadedAvaHash;
        streamerInfo.userAvatarHash = userAvaHash;
        return streamerInfo;
    }
}

module.exports = StreamerInfoGenerator;