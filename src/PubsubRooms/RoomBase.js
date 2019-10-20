const Room = require('ipfs-pubsub-room');
const dataConverter = require('../helpers/dataConverters');
class RoomBase {
    constructor(ipfsInstance, roomName) {
        this.roomName = roomName;
        this.room = Room(ipfsInstance, roomName);
    }

    sendMessage(message) {
        let finalMessage = null;

        switch (typeof(message)) {
            case "string": {
                finalMessage = message;
                break;
            }
            case "object": {
                finalMessage = dataConverter.convertObjectToBase64String(message);
                break;
            }
            case "number": {
                finalMessage = message.toString();
                break;
            }
            default: {
                break;
            }
        }

        if(!finalMessage) {
            console.error(`Room: ${this.roomName} Cannot send message ! ${finalMessage}`);
            return;
        }

        this.room.broadcast(finalMessage);
    }
}

module.exports = RoomBase;