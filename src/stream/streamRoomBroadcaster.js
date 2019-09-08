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
        const streamerName = this.currentStreamerInfo.nameOfStream;
        this.globalRoom = Room(ipfs,GLOBAL_ROOM_NAME);
        this.streamerRoom = Room(ipfs,streamerName);

        //subscribe to handle errors
        this.globalRoom.on('error', (err) => {
            console.log("UNABLE TO SEND message! \n" + err);
        })
    }

    startBroadcastAboutStream() {
        let globalRoomBroadcaster = this.globalRoom;
        let streamerInfo = this.currentStreamerInfo;
        this.broadcastLoopInformator = setInterval(() => {
            const jsonSTR = JSON.stringify(streamerInfo);
            const bufferedData = new Buffer(jsonSTR);
            const encoded64Data = bufferedData.toString('base64');

            console.log(`Broadcast about stream in ${GLOBAL_ROOM_NAME} with data: \n` + JSON.stringify(streamerInfo));
            globalRoomBroadcaster.broadcast(encoded64Data);
        }, BROADCAST_INTERVAL);
    }

    sendStreamerInfoInGlobalRoom() {
        this.globalRoom.broadcast;
    }

    startBroadcastAboutChunks() {

    }
}

module.exports = StreamRoomBroadcaster;