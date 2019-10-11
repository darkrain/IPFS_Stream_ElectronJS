const crypto = require('crypto');
const appConfig = require('../../appFilesConfig');
const errorDialog = require('../helpers/dialogErrorHelper');
const ipfsUploader = require('../helpers/ipfsUploader');
class StreamerInfoGenerator {
    constructor(ipfsNodeID, streamerName, streamerImg64) {
        this.nodeID = ipfsNodeID;
        this.streamerName = streamerName;
        this.streamerImg64 = streamerImg64;
    }

    async getGeneratedStreamerInfoAsync(ipfsInstance) {
        //Here's data prepared for save in JSON file about streamers
        const nameData = this.nodeID + this.streamerName;
        this.streamDataHash = crypto.createHash('md5').update(nameData).digest("hex");
        const streamerImg64 = this.streamerImg64;
        let streamerInfo = {};

        //try to upload userAva
        let userAvaHash = null;
        try {
            //upload userAvatar image
            const userInfoObject = await appConfig.getParsedDataByPath(appConfig.files.USERINFO_JSON_PATH);
            const userAvaBase64 = userInfoObject.photoBase64;           
            userAvaHash = await ipfsUploader.uploadDataAsBase64Async(ipfsInstance, userAvaBase64);
        } catch (err) {
            errorDialog.showErorDialog('StreamerInfoGenerator', `Cannot upload user avatar in ipfs! \n ${err.message} \n${err.stack}`, true);
        }
        //try upload streamPageAva
        const AVA_IMG_NOHASH_ERR_KEY = "NOTHING";
        let uploadedAvaHash = null;
        try {
            uploadedAvaHash = await ipfsUploader.uploadDataAsBase64Async(ipfsInstance, streamerImg64);
        } catch(err) {
            errorDialog.showErorDialog('StreamerInfoGenerator', `cannot add stream view image in ipfs! \n ${err.message} \n ${err.stack}`, true);
        }

        if(!uploadedAvaHash || uploadedAvaHash === AVA_IMG_NOHASH_ERR_KEY) {
            console.error("AVA HASH INFO IS " + AVA_IMG_NOHASH_ERR_KEY + "! Try again.");
            return null;
        }

        streamerInfo.nameOfStream = this.streamerName;
        streamerInfo.hashOfStreamer = this.streamDataHash;
        streamerInfo.imgAvaHash = uploadedAvaHash;
        streamerInfo.userAvatarHash = userAvaHash;
        return streamerInfo;
    }
}

module.exports = StreamerInfoGenerator;