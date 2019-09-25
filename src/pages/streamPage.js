const PageBase = require('./pageBase');
//External helpers

class StreamPage extends PageBase{
  constructor(streamInitializer, win, electronIPC, streamerInfo) {
      super();
      this.electronIPC = electronIPC;
      this.pageWindow = win;
      this.streamerInfo = streamerInfo;
      this.streamInitializer = streamInitializer; 
      this.subscribeToIpcEvents(this.electronIPC);      
      
      this.streamInitializer.startStream(this.onPlaylistRelativePathUpdated, streamerInfo)
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
