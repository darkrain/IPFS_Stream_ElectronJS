const Room = require('ipfs-pubsub-room');
const EventEmitter = require('events');
const GLOBAL_ROOM_NAME = 'borgStream';

class OnStreamDataRecievedEvent extends EventEmitter {};

class GlobalRoomListener {
    constructor(ipfs) {
        this.ipfs = ipfs;
        this.OnStreamDataRecievedEvent = new OnStreamDataRecievedEvent();
        this.globalRoom = Room(this.ipfs, GLOBAL_ROOM_NAME);
        this.globalRoom.setMaxListeners(0);
        this.globalRoom.removeAllListeners();     
        console.log("Start listening global ROOM!");
        this.subscribeToGlobalRoom();
    }

    subscribeToGlobalRoom() {
        try {
            const globalRoomListenerObj = this;
            this.globalRoom.on('message', (msg) => {
                globalRoomListenerObj.OnStreamDataRecievedEvent.emit('message_recieved', msg);
            });
        } catch(err) {
            throw err;
        }       
    }

    getOnStreamDataRecievedEvent() {
        return this.OnStreamDataRecievedEvent;
    }
}

module.exports = GlobalRoomListener;