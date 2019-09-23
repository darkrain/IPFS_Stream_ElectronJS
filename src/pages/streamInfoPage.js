const dialog = require('electron').dialog;
const StreamInitializer = require('../stream/streamInitializer.js');
const pathModule = require('path');
const PageBase = require('./pageBase');
//External helpers
const imgHelper = require('../helpers/imageLoaderHelper.js');
const DataReadyHelper = require('../helpers/dataReadyCheckHelper.js');
const StreamInfoGenerator = require('../data/StreamerInfoGenerator.js');
const appConfig = require('../../appFilesConfig');
const filesChecker = require('../data/fileCheking');

let streamerInfo = [];

class StreamInfoPage extends PageBase{
  constructor(ipfs, ipfsNodeID, electronIPC, pageWindow) {
      super();
      //initialize class mebmers:
      this.ipfs = ipfs;
      this.ipfsNodeID = ipfsNodeID;
      this.electronIPC = electronIPC;
      this.pageWindow = pageWindow;
      this.dataReadyHelper = new DataReadyHelper();
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
    
    ipc.on('audio-changed', (event, args) => {
      const audioText = args;
      streamPageObj.streamInitializer.setAudioByName(audioText);
    });

    ipc.on('open-file-dialog', async (event, args) => {
        const maxStreamAvaSize = appConfig.fileSizes.MAX_STREAM_AVA_KB_SIZE;
        while(true) { //loop to check if file correct, break if is true  
          try {
            const result = await dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [
                { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
              ]
            });

            const file = result.filePaths[0];
              if(file) {
                if(!filesChecker.isFileWithCorrectSizeSync(file, maxStreamAvaSize)) {
                  //go again if file not supported by size
                  //say that file too largs
                  await dialog.showMessageBox({type:'warning', title:'File size warning', message: `File size more than ${maxStreamAvaSize} KB!!`})
                  continue;
                }
                console.log("Try to openFile: " + file.toString());
                const copiedImgPath = await  imgHelper.copyImageToApplicationFolerAsync(file);
                const fileName = pathModule.basename(copiedImgPath); //to send in client script without path
                event.sender.send('selected-file', fileName);
                streamPageObj.onAvaImageUploaded(copiedImgPath);
                break; //break loop if size is correct

              } else {
                //break if file not checked
                break;
              }

          } catch(err) {
              console.error(`Cannot open stream ava file coz: \n${err.message} \n${err.stack}`);
              throw err;
          }
        }
    });

    ipc.on('streamerNameChanged', (event, args) => {
      streamPageObj.onStreamerNameChanged(args);
    });  
    
    ipc.on('backBtnClicked', (event, args) => {
        super.goToGlobalPage();
    });
    ipc.on('goToStream', (event, args) => {
        //незабываем передавать в аргументах необходимые ссылки, для работы StreamerPage.
        const argsForStream = {
            streamerInfo: streamerInfo,
            streamInitializer: streamPageObj.streamInitializer 
        }
        super.goToPage('streamingPage', argsForStream);
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

    this.dataReadyHelper.checkDataIsReadyAsync(
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
    const streamInfoPageObj = this;
    return new Promise((resolve, rejected) => {
      super.stop();
      streamInfoPageObj.streamInitializer.stopStream();
      resolve();
    });  
  }
  //### End Checking functions
}

module.exports = StreamInfoPage;