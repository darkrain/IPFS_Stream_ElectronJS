const Room = require('ipfs-pubsub-room');

class RoomCounter {
    constructor(ipfs, roomToListen) {
        this.ipfs = ipfs;
        this.roomToListen = roomToListen;
        this.coutOfWatchers = 0;
        this.subscribeToRoom();
    }

    setLastStreamBlock(streamBlockEncoded) {
        this.streamBlockEncoded = streamBlockEncoded;
    }

    subscribeToRoom() {
        this.roomToListen.on('peer joined', (peer) => {
            console.log("ROOM_COUNTER: " + "peer joined!");
            console.log(`Peer info: \n ${peer}`);
            this.coutOfWatchers++;

            if(this.streamBlockEncoded) {
                const peerRoom = Room(this.ipfs, peer);
                peerRoom.broadcast(this.streamBlockEncoded);
            }
        });
        
        this.roomToListen.on('peer left',(peer) => {
            console.log("ROOM_COUNTER: " + "peer left..!");
            this.coutOfWatchers--;
        });
    }
    getCountOfWatchers() {
        return this.coutOfWatchers;
    }

    getAllPeers() {
        return this.roomToListen.getPeers().length;
    }
}

module.exports = RoomCounter;