const streamersMonitor = require('../data/streamersMonitor.js');
const PageBase = require('./pageBase');
const StreamersDataHandler = require('../Managers/StreamersDataHandler');

class GlobalRoomPage extends PageBase {
    constructor(ipfs, ipc, win, streamersDataHandler) {
        super();
        this.ipfs = ipfs;
        this.ipc = ipc;
        this.win = win;
        this.streamersDataHandler = streamersDataHandler;

        //Call at start
        this.updatePageAboutStreamers();

        //subscribe to streamerDataHandler event to update data:
        this.streamersDataHandler.dataEvent.on('dataChanged', () => {
            console.log("!!!UPDATING STREAMER PAGE EMITTED!!!");
            this.updatePageAboutStreamers();
        });
    }

    updatePageAboutStreamers() {
        streamersMonitor.getStreamersDataAsync(this.ipfs).then((streamersArray) => {
            console.log("Streamers array updated! \n ");
            this.win.webContents.send('listOfStreamersUpdated', streamersArray);
        }).catch(err => {
            throw err;
        });
    }
}

module.exports = GlobalRoomPage;