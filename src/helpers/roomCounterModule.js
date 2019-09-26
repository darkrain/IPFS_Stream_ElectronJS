class RoomCounter {
    constructor(roomToListen) {
        this.roomToListen = roomToListen;
        this.coutOfWatchers = 0;
        this.subscribeToRoom();
    }
    subscribeToRoom() {
        this.roomToListen.on('peer joined', (peer) => {
            this.coutOfWatchers++;
        });
        
        this.roomToListen.on('peer left', (peer) => {
            this.coutOfWatchers--;
        });
    }
    getCountOfWatchers() {
        return this.coutOfWatchers;
    }
}

module.exports = RoomCounter;