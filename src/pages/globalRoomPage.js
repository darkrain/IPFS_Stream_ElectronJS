const Room = require('ipfs-pubsub-room');
const GLOBAL_ROOM_NAME = 'borgStream';

class GlobalRoomPage {
    constructor(ipfs, ipc, win) {
        this.ipfs = ipfs;
        this.ipc = ipc;
        this.win = win;

        this.globalRoom = Room(this.ipfs, GLOBAL_ROOM_NAME);
        this.initializeListenersForRooms();
    }

    initializeListenersForRooms() {
        this.globalRoom.on('subscribed', () => {
            console.log(`Subscribed to ${GLOBAL_ROOM_NAME}!`);
        });
        this.globalRoom.on('message', (msg) => {
            console.log(`Message getted: \n from: ${msg.from} \n data: ${msg.data}`);
        })
    }
}

module.exports = GlobalRoomPage;