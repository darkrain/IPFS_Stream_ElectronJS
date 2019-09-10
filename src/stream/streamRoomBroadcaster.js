const Room = require('ipfs-pubsub-room');

const BROADCAST_INTERVAL = 10000; //ms
const GLOBAL_ROOM_NAME = 'borgStream';
class StreamRoomBroadcaster {
    constructor(ipfs, streamerInfo) {
        this.ipfs = ipfs;
        this.rooms = {};
        this.initializeRooms(streamerInfo);
    }

    initializeRooms(streamerInfo) {
        const broadcasterObj = this;
        let ipfs = this.ipfs;      
        this.currentStreamerInfo = streamerInfo;
        const streamerHash = this.currentStreamerInfo.hashOfStreamer;
        this.globalRoom = Room(ipfs,GLOBAL_ROOM_NAME);
        console.log("Room broadcaster of streamer with name: " + streamerHash);
        this.streamerRoom = Room(ipfs,streamerHash);

        //subscribe to handle errors
        this.globalRoom.on('error', (err) => {
            console.log("UNABLE TO SEND message! \n" + err);
        })
    }

    startBroadcastAboutStream() {
        const roomBroadcasterObj = this;
        let globalRoomBroadcaster = this.globalRoom;
        let streamerInfo = this.currentStreamerInfo;
        this.broadcastLoopInformator = setInterval(() => {
            const jsonSTR = JSON.stringify(streamerInfo);
            const encoded64Data = roomBroadcasterObj.getEncodedData(jsonSTR);

            console.log(`Broadcast about stream in ${GLOBAL_ROOM_NAME} with data: \n` + JSON.stringify(streamerInfo));
            globalRoomBroadcaster.broadcast(encoded64Data);
        }, BROADCAST_INTERVAL);
    }


    startBroadcastAboutSteramBlock(streamBlock) {
        const streamBlockStr = JSON.stringify(streamBlock);
        const encodedBlock = this.getEncodedData(streamBlockStr);
        this.streamerRoom.broadcast(encodedBlock);
        console.log(`Broadcasted about block! \n data: ${streamBlockStr} \n encoded: ${encodedBlock}`);
    }

    getEncodedData(data) {
        const buffer = new Buffer(data);
        return buffer.toString('base64');
    }
}

module.exports = StreamRoomBroadcaster;