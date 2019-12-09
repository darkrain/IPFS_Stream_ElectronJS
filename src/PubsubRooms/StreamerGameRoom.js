const RoomBase = require('./RoomBase');

class StreamerGameRoom extends RoomBase {
    constructor(ipfsInstance, streamerName) {
        this.gameRoomName = `${streamerName}_game`;
        super(ipfsInstance, this.gameRoomName);
    }
}