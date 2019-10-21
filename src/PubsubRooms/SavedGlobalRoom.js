const RoomBase = require('./RoomBase');
const RoomName = require('../../appFilesConfig').ROOMS.SAVE_GLOBAL_ROOM;

class SavedGlobalRoom extends RoomBase {
    constructor(ipfsInstance) {
        super(ipfsInstance, RoomName);
    }
}

module.exports = SavedGlobalRoom;