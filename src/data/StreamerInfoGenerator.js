const crypto = require('crypto');
const appConfig = require('../config/appFilesConfig');
const errorDialog = require('../helpers/dialogErrorHelper');
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

        const AVA_IMG_NOHASH_ERR_KEY = "NOTHING";
        let avaHashInfo = await new Promise((resolve, rejected) => {
            //upload image
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

        return streamerInfo;
    }
}

module.exports = StreamerInfoGenerator;