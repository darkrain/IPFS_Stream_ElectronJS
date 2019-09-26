class RoomCounter {
    constructor(roomToListen) {
        this.roomToListen = roomToListen;
        this.coutOfWatchers = 0;
        this.subscribeToRoom();
    }
    subscribeToRoom() {
        this.roomToListen.on('peer joined', (peer) => {
            console.log("ROOM_COUNTER: " + "peer joined!");
            this.coutOfWatchers++;
        });
        
        this.roomToListen.on('peer left', (peer) => {
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