const RoomListener = require('./RoomListener');
const fs = require('fs');
const appConfig = require('../../appFilesConfig');

class SavedGlobalRoomListener extends RoomListener {
    constructor(room) {
        super(room);
        this.roomEvent.on('onObjectGetted', (obj) => {
            console.log(`SavedGlobal room getted object message: \n${JSON.stringify(obj)}`);

            //TODO realize save streams data locally
        });
    }
    save() {

    }

}

module.exports = SavedGlobalRoomListener;