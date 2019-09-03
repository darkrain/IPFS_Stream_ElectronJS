const dialog = require('electron').dialog;
const StreamInitializer = require('../stream/streamInitializer.js');
const pathModule = require('path');

//External helpers
const imgHelper = require('../helpers/imageLoaderHelper.js');
const dataReadyHelper = require('../helpers/dataReadyCheckHelper.js');
const StreamInfoGenerator = require('../data/StreamerInfoGenerator.js');
const linkCheckingHelper = require('../helpers/linksCheckHelper.js');

class StreamPage {
  constructor(ipfs, ipfsNodeID, electronIPC, pageWindow) {
      linkCheckingHelper('Stream page', [ipfs, ipfsNodeID, electronIPC]);
      //initialize class mebmers:
      this.ipfs = ipfs;
      this.ipfsNodeID = ipfsNodeID;
      this.electronIPC = electronIPC;
      this.pageWindow = pageWindow;

      this.streamInitializer = new StreamInitializer(this.ipfs); 
      this.subscribeToIpcEvents(this.electronIPC);      
      
      //refresh firstable
      this.onStreamerDataUpdated();
  }

  subscribeToIpcEvents = (ipc) => {
    let streamPageObj = this;
    let win = this.pageWindow;
    //### IPC calls ###
    ipc.on('update-stream-state', function (event, arg) {
      if( arg == 'start' ){  
        streamPageObj.streamInitializer.startStream(streamPageObj.onPlaylistRelativePathUpdated);
        win.webContents.send('streamState', 'started')
      }

      if( arg == 'stop' ){  
        streamPageObj.streamInitializer.stopStream();
        streamPageObj.streamInitializer.resetStream();
        win.webContents.send('streamState', 'stoped')
      }
    })

    ipc.on('camera-changed', (event, args) => {
      const camText = args;
      streamPageObj.streamInitializer.setCameraByName(camText);
    });

    ipc.on('open-file-dialog', (event, args) => { 
      dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
        ]
      }).then(result => { 
        console.log(result.canceled);
        console.log(result.filePaths);
        const file = result.filePaths[0];
          if(file) {
            console.log("Try to openFile: " + file.toString());
            imgHelper.copyImageToApplicationFolerAsync(file).then((copiedImgPath) => {
              const fileName = pathModule.basename(copiedImgPath); //to send in client script without path
              event.sender.send('selected-file', fileName);
              streamPageObj.onAvaImageUploaded(copiedImgPath);
          })};
        })
        .catch(err => {
          console.err(err);
        });
    });

    ipc.on('streamerNameChanged', (event, args) => {
      streamPageObj.onStreamerNameChanged(args);
    });   
    //### END IPC calls ###
  } 

  //### Callbacks for Events's ###
  onAvaImageUploaded = (filePath) => {
    this.streamerImgPath = filePath;
    this.onStreamerDataUpdated();
  }

  onIpfsNodeIDGetted = (nodeID) => {
    this.ipfsNodeID = nodeID;
    this.onStreamerDataUpdated();
  }

  onStreamerNameChanged = (name) => {
    this.streamerName = name;
    this.onStreamerDataUpdated();
  }

  onMainPageLoaded = () => {
    console.log("MAIN PAGE LOADED!");
    //checkData is ready first run
    this.checkAllData();
  }

  onPlaylistRelativePathUpdated = () => {
    const videoPath = this.streamInitializer.getLastFullVideoPath(); 
    console.log("Relative path for videos updated!: " + videoPath);
    this.pageWindow.webContents.send('video-playlist-path-changed', videoPath);
  }

  //### END Callbacks for Event's ###

  //### Checking functions
  onStreamerDataUpdated = () => {
    if(!this.ipfsNodeID)
      this.ipfsNodeID = this.ipfs.id;
    console.log("Try update streamer data by values: " + JSON.stringify([
      this.streamerName,
      this.streamerImgPath, 
      this.ipfsNodeID
    ]));
    if(this.streamerName && this.streamerImgPath && this.ipfsNodeID) {
        this.streamInfoGenerator = new StreamInfoGenerator(this.ipfsNodeID,
           this.streamerName,
            this.streamerImgPath);       
    }
    this.checkAllData();
  }

  checkAllData = () => {
    let win = this.pageWindow;
    dataReadyHelper.checkDataIsReadyAsync(
      this.ipfs,
       this.pageWindow,
        this.streamInitializer,
         this.streamInfoGenerator
         ).then((isReady) => {
            console.log("Data checking... result: " + isReady);
            win.webContents.send('all-data-ready', isReady);

            //update front page by streamer info array
            const streamerNameInfo = this.streamerName ? this.streamerName : "empty";
            const streamerImgPathInfo = this.streamerImgPath ? this.streamerImgPath : "empty";
            const ipfsNodeIdInfo = this.ipfsNodeID ? this.ipfsNodeID : "empty";
            const streamInfoArray = {
              "StreamerName": streamerNameInfo,
              "AvatarHash": streamerImgPathInfo,
              "IPFS_NodeID": ipfsNodeIdInfo
            };
            win.webContents.send('update-requirements', streamInfoArray);
    });
  }
  //### End Checking functions
}

module.exports = StreamPage;
