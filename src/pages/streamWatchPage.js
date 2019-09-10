const Room = require('ipfs-pubsub-room');

class StreamWatchPage {
    constructor(ipfs, ipc, win, streamerInfo){
        this.ipfs = ipfs;
        this.ipc = ipc;
        this.win = win;
        this.streamerInfo = streamerInfo;
        
        win.webContents.send('streamerDataGetted', this.streamerInfo);
        
        this.subscribeToStreamerRoom(this.streamerInfo);      
    }

    subscribeToStreamerRoom(streamerInfo) {
        const streamHash = streamerInfo.hashOfStreamer;
        console.log("Subscribe to streamer room name: " + streamHash);
        this.streamerRoom = Room(this.ipfs, streamHash);

        this.streamerRoom.on('subscribed', () => {
            console.log(`Subscribed to ${streamHash} room!`);
        });
        this.streamerRoom.on('message', (msg) => {
            const messageStr = msg.data.toString();
            console.log("Getted message from streamer: " + messageStr);
        });
    }
}

module.exports = StreamWatchPage;