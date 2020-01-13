const Room = require('ipfs-pubsub-room');
const EventEmitter = require('events');

class ChatRoomEvent extends EventEmitter { }

class ChatRoom {
    //streamer hash is the channelName + nodeID as base64, which should be same as streamer room
    //where spamming info about chunks...
    constructor(ipfs, streamerHash) {
        this.ipfs = ipfs;
        this.streamerHash = streamerHash;
        this.chatRoomName = this.getChatRoomname();
        this.chatRoom = Room(this.ipfs, this.chatRoomName);
        
        this.chatRoom.setMaxListeners(0);
        this.chatRoomEvent = new ChatRoomEvent();
        this.removeListenersAsync().then(() => {
            this.chatRoom.on('message', (msg) => {
                const messageBase64Content = msg.data.toString();
                const buffer = new Buffer(messageBase64Content, 'base64');
                const rawData = buffer.toString();
                console.log(`Message from CHAAT: ${JSON.stringify(rawData)}`);
                try {
                    const messageData = JSON.parse(rawData);
                    this.chatRoomEvent.emit('onMessage', messageData);
                } catch(err) {
                    console.error(`Cannot get message from chat! Coz: ${err.message}`);
                }
                
            });
        }).catch(err => {
            console.error(`CHAT ROOM ERROR! \n ${err.toString()}`)
        });   

    }

    leaveFromRoomAsync() {
        return this.chatRoom.leave();
    }

    removeListenersAsync() {
        this.chatRoom.eventNames().forEach(n => {
            this.chatRoom.removeAllListeners(n);
        });
        this.chatRoomEvent.eventNames().forEach(n => {
            this.chatRoomEvent.removeAllListeners(n);
        });
        return new Promise(resolve => setTimeout(resolve,2000));
    }

    sendMessage(messageObj) {
        const buffer = new Buffer(JSON.stringify(messageObj));
        this.chatRoom.broadcast(buffer.toString('base64'));
    }

    getChatRoomname() {
        const chatKey = '_CHAT';
        return this.streamerHash + chatKey;
    }
}

module.exports = ChatRoom;