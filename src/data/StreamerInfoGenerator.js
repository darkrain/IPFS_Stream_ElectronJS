const crypto = require('crypto');

class StreamerInfoGenerator {
    constructor(ipfsNodeID, streamerName, streamerImg) {    
        this.nodeID = ipfsNodeID;
        this.streamerName = streamerName;
        this.streamerImgPath = streamerImg;     
    }

    getGeneratedStreamerInfo() {
        const nameData = this.nodeID + this.streamerName;
        this.streamDataHash = crypto.createHash('md5').update(nameData).digest("hex");

        const streamerDataHash = this.streamDataHash;
        const streamerImgPath = this.streamerImgPath;
        return new Promise((resolve, rejected) => {
            //upload image
            ipfs.addFromFs(streamerImgPath, { }, (err, result) => {
                if (err) { 
                    console.error("CANNOT UPLOAD AVA TO IPFS!: \n" + err);
                    rejected();
                }

                console.log("Result of uploading img: \n" + JSON.stringify(result));
                resolve(result);
            });
        });     
    }
}

module.exports = StreamerInfoGenerator;