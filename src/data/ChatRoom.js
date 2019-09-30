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
        this.chatRoom.removeAllListeners();
        this.chatRoom.setMaxListeners(0);
        this.chatRoomEvent = new ChatRoomEvent();

        this.chatRoom.on('message', (message) => {
            const from = message.from;
            const data = message.data.toString();
            const msgData = {
                from: from ,
                message: data
            };
            this.chatRoomEvent.emit('onMessage', msgData);
        });

    }

    sendMessage(messageStr) {
        const message = `From: ${this.ipfs.id} \n Message: ${messageStr}`;
        this.chatRoom.broadcast(message);
    }

    getChatRoomname() {
        const chatKey = '_CHAT';
        return this.streamerHash + chatKey;
    }
}

module.exports = ChatRoom;