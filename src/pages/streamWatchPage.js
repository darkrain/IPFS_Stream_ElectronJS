const Room = require('ipfs-pubsub-room');

class StreamWatchPage {
    constructor(ipfs, ipc, win, streamerInfo){
        this.ipfs = ipfs;
        this.ipc = ipc;
        this.win = win;
        this.streamerInfo = streamerInfo;
        
        win.webContents.send('streamerDataGetted', this.streamerInfo);
    }
}

module.exports = StreamWatchPage;