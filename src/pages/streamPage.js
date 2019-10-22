const PageBase = require('./pageBase');
const ChatRoomInitializer = require('../helpers/ChatRoomInitializer');
const StreamSaver = require('../stream/StreamSaver');
const SavedGlobalRoom = require('../PubsubRooms/SavedGlobalRoom');
const url = require('url');

class StreamPage extends PageBase{
  constructor(ipfs, streamInitializer, win, electronIPC, streamerInfo) {
      super();
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
    ipc.on('backBtnClicked', (event, args) => {
        super.goToGlobalPage();
    });
    ipc.on('saveStreamClicked', (event, args) => {
        const lastBlock = this.streamInitializer.getStreamUploader().getLastSteamBlock();
        if(!lastBlock) {
            console.error(`Last block not initialized in stream uploader!!! RETURN!`);
            return;
        }
        this.streamSaver = new StreamSaver(this.ipfs, lastBlock, this.streamerInfo);
        this.streamSaver.getAllSavedStreamData().then((data) => {
            if(!this.savedGlobalRoom) {
                this.savedGlobalRoom = new SavedGlobalRoom(this.ipfs);
            }
            this.savedGlobalRoom.sendMessage(data);

        }).catch(err => {
            throw err;
        })
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
      this.streamInitializer.stopStream();
      resolve();
    }); 
  }
}

module.exports = StreamPage;
