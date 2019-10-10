const dialog = require('electron').dialog;
const StreamInitializer = require('../stream/streamInitializer.js');
const pathModule = require('path');
const PageBase = require('./pageBase');
//External helpers
const fileHandler = require('../data/fileHandling');
const DataReadyHelper = require('../helpers/dataReadyCheckHelper.js');
const StreamInfoGenerator = require('../data/StreamerInfoGenerator.js');
const appConfig = require('../../appFilesConfig');
const filesChecker = require('../data/fileCheking');

let streamerInfo = [];

class StreamInfoPage extends PageBase{
  constructor(ipfs, ipfsNodeID, electronIPC, pageWindow) {
      super();
      //initialize class mebmers:
      this.base64Ava = '';
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

    //Calling when all data is READY!
    ipc.on('dataReady', async (event, args) => {
        //const necessaryKeys = ['streamName', 'avaBase64']; << rules from API
        this.onStreamerNameChanged(args.streamName);
        this.onAvaImageUploaded(args.avaBase64);
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
  onAvaImageUploaded = (fileContents) => {
    this.streamerImgBase64 = fileContents;
    this.onStreamerDataUpdated();
  };

  onStreamerNameChanged = (name) => {
    this.streamerName = name;
    this.onStreamerDataUpdated();
  };

  //### END Callbacks for Event's ###

  //### Checking functions
  onStreamerDataUpdated = () => {
    if(!this.ipfsNodeID)
      this.ipfsNodeID = this.ipfs.id;
    console.log("Try update streamer data by values: " + JSON.stringify([
      this.streamerName,
      this.streamerImgBase64,
      this.ipfsNodeID
    ]));
    if(this.streamerName && this.streamerImgBase64 && this.ipfsNodeID) {
        this.streamInfoGenerator = new StreamInfoGenerator(this.ipfsNodeID,
           this.streamerName,
            this.streamerImgBase64);
    }
    this.checkAllData();
  }

  checkAllData = () => {
    let win = this.pageWindow;

    //update front page by streamer info array
    const streamerNameInfo = this.streamerName ? this.streamerName : "empty";
    const streamerImgBase64Info = this.streamerImgBase64 ? this.streamerImgBase64 : "empty";
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
              "AvatarHash": streamerImgBase64Info,
              "IPFS_NodeID": ipfsNodeIdInfo
            };
            win.webContents.send('update-requirements', streamInfoArray);

            if(readyData.isDataReady) {
                streamerInfo = readyData.streamInfo;    
                console.log("Streamer info updated! : \n" + JSON.stringify(streamerInfo));
            }
    }).catch(err => {
      throw err;
    })
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