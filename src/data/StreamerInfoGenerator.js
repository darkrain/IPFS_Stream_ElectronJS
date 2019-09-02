const crypto = require('crypto');

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
        let streamerInfo = [];
        const AVA_IMG_NOHASH_ERR_KEY = "NOTHING";
        let avaHashInfo = await new Promise((resolve, rejected) => {
            //upload image
            ipfsInstance.addFromFs(streamerImgPath, { }, (err, result) => {
                if (err) { 
                    console.error("CANNOT UPLOAD AVA TO IPFS!: \n" + err);
                    resolve(AVA_IMG_NOHASH_ERR_KEY);
                }

                console.log("Result of uploading img: \n" + JSON.stringify(result));
                resolve(result);
            });
        }); 
        if(!avaHashInfo || avaHashInfo === AVA_IMG_NOHASH_ERR_KEY) {
            console.err("AVA HASH INFO IS " + AVA_IMG_NOHASH_ERR_KEY + "! Try again.");
            return streamerInfo;
        }
        const uploadedAvaHash = avaHashInfo[0].hash;
        streamerInfo.push({nameOfStream: this.streamerName});
        streamerInfo.push({hashOfStreamer: this.streamDataHash});
        streamerInfo.push({imgAvaHash: uploadedAvaHash});

        return streamerInfo;
    }
}

module.exports = StreamerInfoGenerator;