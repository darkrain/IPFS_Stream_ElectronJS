const PageBase = require('./pageBase');
const ChatRoomInitializer = require('../helpers/ChatRoomInitializer');
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
  }

  subscribeToBroadcastEvents() {
    const streamPageObj = this;
    const broadcastEvent = this.streamInitializer.getStreamRoomBroadcaster().getBroadcastEvent();
    broadcastEvent.on('onStreamBroadcasted', (args) => {
      console.log("Broadcast event!: " + args);
      if(args) {
        const countOfWatchers = args.watchCount;
        streamPageObj.pageWindow.webContents.send('watcher-count-update', countOfWatchers);
      }     
    });
  }
  
  subscribeToIpcEvents = (ipc) => {
    //### IPC calls ###   
    ipc.on('backBtnClicked', (event, args) => {
        super.goToGlobalPage();
    });
    //### END IPC calls ###
  } 

  //### Callbacks for Events's ###
  onPlaylistRelativePathUpdated = () => {
    const delayBeforePlay = 2000;
    setTimeout(() => {
      this.pageWindow.webContents.send('video-playlist-path-changed');
    }, delayBeforePlay); 
  }
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
