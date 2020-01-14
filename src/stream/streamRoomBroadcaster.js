const Room = require('ipfs-pubsub-room');
const RoomCounter = require('../helpers/roomCounterModule');
const EventEmitter = require('events');
const userInfoLoader = require('../data/userInfoLoader');
const BROADCAST_INTERVAL = 10000; //ms
const GLOBAL_ROOM_NAME = 'borgStream';
const appConfig = require('../../appFilesConfig');
const logger = require('../data/logger');
class BroadcastEvent extends EventEmitter {}

class StreamRoomBroadcaster {
    constructor(ipfs, streamerInfo) {
        this.ipfs = ipfs;
        this.rooms = {};
        this.watchersCount = 0;
        this.broadcastEvent = new BroadcastEvent();
        this.initializeRooms(streamerInfo);
        
        this.lastEncodedBlock = null;
        this.lastStreamBlock = null;
        this.broadcastIntervalTime = 2000;

        this.intervalTime = setInterval(() => {
            this.startBroadcastAboutStreamBlock(this.lastStreamBlock);
        }, this.broadcastIntervalTime);

        this.userData = {
            userName: 'UNKNOWN_NAME',
            nickName: 'UNKNOWN_NICKNAME'
        };
        if(userInfoLoader.isUserDataReady()) {
            userInfoLoader.getUserInfoData(appConfig.files.USERINFO_JSON_PATH).then(data => {
                if(data) {
                    this.userData.userName = data.name;
                    this.userData.nickName = data.nickname;
                }
            }).catch((err) => {
                logger.printErr(err);
                throw err;
            })
        }
    }

    async updateLastStreamBlockAsync(streamBlock) {
        this.lastStreamBlockEncoded = await this.encodeStreamBlockAsync(streamBlock);
    }

    initializeRooms(streamerInfo) {
        const broadcasterObj = this;
        let ipfs = this.ipfs;      
        this.currentStreamerInfo = streamerInfo;
        const streamerHash = this.currentStreamerInfo.hashOfStreamer;
        //TODO why streamer hash is UNDEFINED?
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
            logger.printErr(err);
            throw err;
        });

        //initialize room counter
        this.roomCounter = new RoomCounter(this.ipfs, this.streamerRoom);    
    }

    startBroadcastAboutStream() {
        const roomBroadcasterObj = this;
        const globalRoomBroadcaster = this.globalRoom;
        const streamerInfo = this.currentStreamerInfo;
        this.broadcastLoopInformator = setInterval(() => {
            try {
                if(!this.lastStreamBlockEncoded) {
                    //skip without blocks
                    return;
                }
                const countOfwarchers = roomBroadcasterObj.roomCounter.getAllPeers();
                streamerInfo.watchersCount = countOfwarchers;
                streamerInfo.userName = this.userData.userName;
                streamerInfo.nickname = this.userData.nickName;
                streamerInfo.lastStreamBlockEncoded = this.lastStreamBlockEncoded;
                const jsonSTR = JSON.stringify(streamerInfo);
                const encoded64Data = roomBroadcasterObj.getEncodedData(jsonSTR);
    
                console.log(`Broadcast about stream in ${GLOBAL_ROOM_NAME} !`);
                globalRoomBroadcaster.broadcast(encoded64Data);

                //update watchersCount
                roomBroadcasterObj.watchersCount = countOfwarchers;
                //emit each time
                const dataObject = {
                    watchCount: roomBroadcasterObj.watchersCount
                };
                roomBroadcasterObj.broadcastEvent.emit('onStreamBroadcasted', dataObject);
            } catch(err) {
                logger.printErr(err);
                throw err;
            }
            
        }, BROADCAST_INTERVAL);
    }
    getBroadcastEvent() {
        return this.broadcastEvent;
    }
    stopBroadcastAboutStream() {
        if(this.broadcastLoopInformator) {
            this.streamerRoom.broadcast("STREAM_END");
            console.log("StreamRoomBroadcaster: Stop broadcast about stream!");
            clearInterval(this.broadcastLoopInformator);
        }
    }

    stopGameEventFromStream(isTrue) {
        let msg = isTrue === true ? 'GAME_END_TRUE' : 'GAME_END_FALSE';
        this.streamerRoom.broadcast(msg);
    }

    setLastStreamBlock(streamBlock) {
        this.lastStreamBlock = streamBlock;
    }

    startBroadcastAboutStreamBlock(streamBlock) {
        if(!streamBlock)
            return;
        //Set count of watchers too
        streamBlock.streamWatchCount = this.roomCounter.getAllPeers();
        this.encodeStreamBlockAsync(streamBlock).then((encodedBlock) => {
            if(this.lastEncodedBlock === encodedBlock) {
                //dont stop broadcast
                this.streamerRoom.broadcast(this.lastEncodedBlock);
                return;
            }
            this.lastEncodedBlock = encodedBlock;
            this.roomCounter.setLastStreamBlock(encodedBlock);
            this.streamerRoom.broadcast(encodedBlock);
            console.log(`Broadcasted about block!`);
        }).catch((err) => {
            logger.printErr(err);
            throw err;
        })
    }

    encodeStreamBlockAsync(streamBlock) {
        return new Promise((resolve, rejected) => {
            try {
                const streamBlockStr = JSON.stringify(streamBlock);
                const encodedBlock = this.getEncodedData(streamBlockStr);
                resolve(encodedBlock);
            } catch(err) {
                rejected(err);
            }
        })
    }

    getEncodedData(data) {
        const buffer = new Buffer(data);
        return buffer.toString('base64');
    }
}

module.exports = StreamRoomBroadcaster;