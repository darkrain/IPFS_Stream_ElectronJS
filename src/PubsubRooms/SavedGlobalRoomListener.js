const RoomListener = require('./RoomListener');
const SavedStreamsDataHandler = require('../DataHandlers/SavedStreamsDataHandler');

class SavedGlobalRoomListener extends RoomListener {
    constructor(room) {
        super(room);
        this.savedStreamsDataHandler = new SavedStreamsDataHandler();
        this.roomEvent.on('onObjectGetted', (obj) => {
            console.log(`SavedGlobal room getted object message: \n${JSON.stringify(obj)}`);

            this.savedStreamsDataHandler.saveDataAsync(obj).then(() => {
                console.log(`Stream saved.`);
            })
            //TODO realize save streams data locally
        });
    }
}

module.exports = SavedGlobalRoomListener;