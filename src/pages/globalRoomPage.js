const streamersMonitor = require('../data/streamersMonitor.js');
const PageBase = require('./pageBase');
const SavedStreamsDataHandler = require('../DataHandlers/SavedStreamsDataHandler');

class GlobalRoomPage extends PageBase {
    constructor(ipfs, ipc, win, streamersDataHandler) {
        super();
        this.ipfs = ipfs;
        this.ipc = ipc;
        this.win = win;
        this.streamersDataHandler = streamersDataHandler;
        this.savedStreamsDataHandler = new SavedStreamsDataHandler();

        //Call at start
        //this.updatePageAboutStreamers();

        //subscribe to streamerDataHandler event to update data:
        this.streamersDataHandler.dataEvent.on('dataChanged', () => {
            console.log("!!!UPDATING STREAMER PAGE EMITTED!!!");
            this.updatePageAboutStreamers();
        });

        this.updatePageAboutSavedStreams().then(() => {
            console.log(`!!!Saved streams updated!!!!`);
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

    async updatePageAboutSavedStreams() {
        const streamersData = await this.savedStreamsDataHandler.readDataAsync();

        const convertedStreamersInfo = await Promise.all(streamersData.map(async (streamData) => {
            const generatedData = await streamersMonitor.generateDataForStreamerAsync(streamData.streamerInfo, this.ipfs);
            generatedData.date = streamData.streamerInfo.date;
            generatedData.recordKey = streamData.recordKey;
            return generatedData;
        }));
        this.win.webContents.send(`savedStreamsUpdated`, convertedStreamersInfo);
    }
}

module.exports = GlobalRoomPage;