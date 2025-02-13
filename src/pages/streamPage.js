const PageBase = require('./pageBase');
const ChatRoomInitializer = require('../helpers/ChatRoomInitializer');
const StreamSaver = require('../stream/StreamSaver');
const SavedGlobalRoom = require('../PubsubRooms/SavedGlobalRoom');
const url = require('url');

class StreamPage extends PageBase{
  constructor(ipfs, streamInitializer, win, electronIPC, streamerInfo, gameData, ipfsApi) {
      super();
      try {
          this.ipfsApi = ipfsApi; // < API for video
          this.ipfs = ipfs;
          this.electronIPC = electronIPC;
          this.pageWindow = win;
          this.streamerInfo = streamerInfo;
          this.streamInitializer = streamInitializer;
          this.subscribeToIpcEvents(this.electronIPC);

          this.streamInitializer.startStream(this.onPlaylistRelativePathUpdated, streamerInfo);
          this.subscribeToBroadcastEvents();

          this.chatRoomInitializer = new ChatRoomInitializer(this.ipfs, this.electronIPC, this.pageWindow, this.streamerInfo);
          this.chatRoomInitializer.initialize();
          this.streamSaver = null;
          this.gameData = gameData;

          if(this.gameData) {
            this.pageWindow.webContents.send('gameEventReady', this.gameData);
          }

      } catch(err) {
          throw err;
      }
  }

  subscribeToBroadcastEvents() {
    const streamPageObj = this;
    const broadcastEvent = this.streamInitializer.getStreamRoomBroadcaster().getBroadcastEvent();
    broadcastEvent.on('onStreamBroadcasted', (args) => {
      if(args) {
        const countOfWatchers = args.watchCount;
        streamPageObj.pageWindow.webContents.send('watcher-count-update', countOfWatchers);
      }     
    });
  }
  
  subscribeToIpcEvents(ipc) {
    //### IPC calls ###   

    ipc.on('gameEventEnded', (event, args) => {
      const broadcaster = this.streamInitializer.getStreamRoomBroadcaster();
      broadcaster.stopGameEventFromStream(args);
    })

    ipc.on('backBtnClicked', (event, args) => {
        super.goToGlobalPage();
    });
    ipc.on('saveStreamClicked', async (event, args) => {
      console.log(`TRY to SAVE stream...`);
        try {
            const lastBlock = this.streamInitializer.getStreamUploader().getLastSteamBlock();
            if(!lastBlock) {
                console.error(`Last block not initialized in stream uploader!!! RETURN!`);
                super.goToGlobalPage();
                return;
            }
            this.streamSaver = new StreamSaver(this.ipfsApi.getClient(), lastBlock, this.streamerInfo);
            const savedData =  await this.streamSaver.getAllSavedStreamData();
            if(!this.savedGlobalRoom) 
              this.savedGlobalRoom = new SavedGlobalRoom(this.ipfs);
          
          console.log(`Broadcast about saved stream message! \n ${savedData}`);
          this.savedGlobalRoom.sendMessage(savedData);

            super.goToGlobalPage();
        } catch(err) {
            console.error(`CANNOT SAVE STREAM! COZ: \n ${err.toString()}`);
        }
    });
    //### END IPC calls ###
  }

  //### Callbacks for Events's ###
  onPlaylistRelativePathUpdated = () => {
    const delayBeforePlay = 2000;
    const fullUrl = 'http://localhost:4000/videos/' + this.streamInitializer.streamName + '/master.m3u8';
    setTimeout(() => {
      this.pageWindow.webContents.send('video-playlist-path-changed', fullUrl);
    }, delayBeforePlay);
  };
  //### END Callbacks for Event's ###

  stop() {
    return new Promise((resolve, reject) => {
      super.stop();
      clearInterval(this.streamInitializer.getStreamRoomBroadcaster().intervalTime);
      this.streamInitializer.stopStream();
      resolve();
    }); 
  }
}

module.exports = StreamPage;
