const EventEmitter = require('events').EventEmitter;
class RoomEvent extends EventEmitter {}

class RoomListener {
    constructor(room) {
        this.room = room.getRoomInstance();
        this.roomEvent = new RoomEvent();
        this.room.on('message', (msg) => {
           const data = msg.data.toString();
           //try to detect object type and emit needed event
            try {
                const buffer = new Buffer(data, 'base64');
                const parsedObj = JSON.parse(buffer.toString());
                if(parsedObj) {
                    console.log(`Successfully parsed message to object! onObjectGetted - emitted!`);
                    this.roomEvent.emit('onObjectGetted', parsedObj);
                }
            } catch(err) {
                console.log(`ROOM_LISTENER: Cannot parse message to Object! Reason: ${err.message}`);
                console.log(`Send raw message: ${data.substr(0, data.length / 2)}... onStrMessageGetted - emitted!`);
                this.roomEvent.emit('onStrMessageGetted', data);
            }
        });
    }

    getRoomEvent() {
        return this.roomEvent;
    }
}

module.exports = RoomListener;