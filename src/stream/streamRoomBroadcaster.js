const Room = require('ipfs-pubsub-room');
const RoomCounter = require('../helpers/roomCounterModule');
const EventEmitter = require('events');

const BROADCAST_INTERVAL = 10000; //ms
const GLOBAL_ROOM_NAME = 'borgStream';

class BroadcastEvent extends EventEmitter {}

class StreamRoomBroadcaster {
    constructor(ipfs, streamerInfo) {
        this.ipfs = ipfs;
        this.rooms = {};
        this.watchersCount = 0;
        this.broadcastEvent = new BroadcastEvent();
        this.initializeRooms(streamerInfo);
    }

    initializeRooms(streamerInfo) {
        const broadcasterObj = this;
        let ipfs = this.ipfs;      
        this.currentStreamerInfo = streamerInfo;
        const streamerHash = this.currentStreamerInfo.hashOfStreamer;
        console.log("Room broadcaster of streamer with name: " + streamerHash);

        //setup rooms
        this.globalRoom = Room(ipfs,GLOBAL_ROOM_NAME);
        this.streamerRoom = Room(ipfs,streamerHash);
        this.streamerRoom.removeAllListeners();
        this.globalRoom.removeAllListeners();
        this.streamerRoom.setMaxListeners(0);
        this.globalRoom.setMaxListeners(0);
        //subscribe to handle errors
        this.globalRoom.on('error', (err) => {
            throw err;
        });

        //initialize room counter
        this.roomCounter = new RoomCounter(this.streamerRoom);    
    }

    startBroadcastAboutStream() {
        const roomBroadcasterObj = this;
        const globalRoomBroadcaster = this.globalRoom;
        const streamerInfo = this.currentStreamerInfo;
        this.broadcastLoopInformator = setInterval(() => {
            try {
                const jsonSTR = JSON.stringify(streamerInfo);
                const encoded64Data = roomBroadcasterObj.getEncodedData(jsonSTR);
    
                console.log(`Broadcast about stream in ${GLOBAL_ROOM_NAME} !`);
                globalRoomBroadcaster.broadcast(encoded64Data);

                //update watchersCount
                roomBroadcasterObj.watchersCount = roomBroadcasterObj.roomCounter.getAllPeers();
                //emit each time
                const dataObject = {
                    watchCount: roomBroadcasterObj.watchersCount
                }
                roomBroadcasterObj.broadcastEvent.emit('onStreamBroadcasted', dataObject);
            } catch(err) {
                throw err;
            }
            
        }, BROADCAST_INTERVAL);
    }
    getBroadcastEvent() {
        return this.broadcastEvent;
    }
    stopBroadcastAboutStream() {
        if(this.broadcastLoopInformator) {
            console.log("StreamRoomBroadcaster: Stop broadcast about stream!");
            clearInterval(this.broadcastLoopInformator);
        }
    }

    startBroadcastAboutSteramBlock(streamBlock) {
        //add peers data
        streamBlock.watchersCount = this.roomCounter.getAllPeers();
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