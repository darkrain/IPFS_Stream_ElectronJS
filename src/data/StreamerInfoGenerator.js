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
        let avaHashInfo = await new Promise((resolve, rejected) => {
            //upload image
            ipfsInstance.addFromFs(streamerImgPath, { }, (err, result) => {
                if (err) { 
                    console.error("CANNOT UPLOAD AVA TO IPFS!: \n" + err);
                    rejected(null);
                }

                console.log("Result of uploading img: \n" + JSON.stringify(result));
                resolve(result);
            });
        }); 
        
        const uploadedAvaHash = avaHashInfo[0].hash;
        streamerInfo.push({nameOfStream: this.streamerName});
        streamerInfo.push({hashOfStreamer: this.streamDataHash});
        streamerInfo.push({imgAvaHash: uploadedAvaHash});

        return streamerInfo;
    }
}

module.exports = StreamerInfoGenerator;