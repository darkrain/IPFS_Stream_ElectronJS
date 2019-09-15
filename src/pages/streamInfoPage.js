const dialog = require('electron').dialog;
const StreamInitializer = require('../stream/streamInitializer.js');
const pathModule = require('path');
const PageBase = require('./pageBase');
//External helpers
const imgHelper = require('../helpers/imageLoaderHelper.js');
const dataReadyHelper = require('../helpers/dataReadyCheckHelper.js');
const StreamInfoGenerator = require('../data/StreamerInfoGenerator.js');
const linkCheckingHelper = require('../helpers/linksCheckHelper.js');

let streamerInfo = [];

class StreamInfoPage extends PageBase{
  constructor(ipfs, ipfsNodeID, electronIPC, pageWindow) {
      super();
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
          console.error(err.toString());
        });
    });

    ipc.on('streamerNameChanged', (event, args) => {
      streamPageObj.onStreamerNameChanged(args);
    });  
    
    ipc.on('backBtnClicked', (event, args) => {
        super.goToGlobalPage();
    });
    ipc.on('goToStream', (event, args) => {
        //незабываем передавать в аргументах необходимые ссылки, для работы StreamerPage.
        super.goToPage('streamingPage');
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
    this.onStreamerDataUpdated();
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

    //update front page by streamer info array
    const streamerNameInfo = this.streamerName ? this.streamerName : "empty";
    const streamerImgPathInfo = this.streamerImgPath ? this.streamerImgPath : "empty";
    const ipfsNodeIdInfo = this.ipfsNodeID ? this.ipfsNodeID : "empty";

    dataReadyHelper.checkDataIsReadyAsync(
      this.ipfs,
       this.pageWindow,
        this.streamInitializer,
         this.streamInfoGenerator
         ).then((readyData) => {
            console.log("Data checking... result: " + readyData.isDataReady);
            const streamInfoArray = {
              "StreamerName": streamerNameInfo,
              "AvatarHash": streamerImgPathInfo,
              "IPFS_NodeID": ipfsNodeIdInfo
            };
            win.webContents.send('update-requirements', streamInfoArray);

            if(readyData.isDataReady) {
                streamerInfo = readyData.streamInfo;    
                console.log("Streamer info updated! : \n" + JSON.stringify(streamerInfo));
            }
    });
  }

  stop() {
    super.stop();
    this.streamInitializer.stopStream();
    this.streamInitializer.resetStream();
  }
  //### End Checking functions
}

module.exports = StreamInfoPage;