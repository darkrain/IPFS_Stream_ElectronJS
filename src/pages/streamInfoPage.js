const dialog = require('electron').dialog;
const StreamInitializer = require('../stream/streamInitializer.js');
const pathModule = require('path');
const PageBase = require('./pageBase');
//External helpers
const fileHandler = require('../data/fileHandling');
const DataReadyHelper = require('../helpers/dataReadyCheckHelper.js');
const StreamInfoGenerator = require('../data/StreamerInfoGenerator.js');
const jsonHelper = require('../helpers/JSONHelpers');

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
      this.streamerInfo = null;
      this.subscribeToIpcEvents(this.electronIPC);      
      
      //refresh firstable
      this.onStreamerDataUpdated();
      
      //game data handling
      this.currentGameData = null;
  }

  subscribeToIpcEvents = (ipc) => {
    let streamPageObj = this;
    let win = this.pageWindow;
    //### IPC calls ###

    ipc.on('gameDataChoiced', (event, args) => {
      if(!args)
        return;
      this.currentGameData = Object.assign({},args); //copy obj
      console.log(`GameDataEvent updated! \n ${JSON.stringify(this.currentGameData)}`);
    });

    //Calling when all data is READY!
    ipc.on('dataReady', async (event, args) => {
        //const necessaryKeys = ['streamName', 'avaBase64']; << rules from API
        this.onStreamerNameChanged(args.streamName);
        this.onAvaImageUploaded(args.avaBase64);
    });

    ipc.on('onQualityChanged', (event, args) => {
      const quality = args;
      this.streamInitializer.setStreamQuality(quality);
    });
    
    ipc.on('backBtnClicked', (event, args) => {
        super.goToGlobalPage();
    });
    ipc.on('goToStream', (event, args) => {
        //незабываем передавать в аргументах необходимые ссылки, для работы StreamerPage.
        //we need to wait about streamerInfo object, so make transition in the interval.
        const timeToWait = 1000;
        const transitionInterval = setInterval(() => {
            if(this.streamerInfo) {
                clearInterval(transitionInterval);
                const argsForStream = {
                    streamerInfo: this.streamerInfo,
                    streamInitializer: streamPageObj.streamInitializer
                };
                console.log(`Transition to streamingPage !!!`);
                super.goToPage('streamingPage', argsForStream);
            }
        }, timeToWait);


    });
    //### END IPC calls ###
  };

  //### Callbacks for Events's ###
  setAudioByName(audioName) {
     this.streamInitializer.setAudioByName(audioName);
  }

  setCameraByName(videoName) {
      this.streamInitializer.setCameraByName(videoName);
  }

  onAvaImageUploaded = (fileContents) => {
    this.streamerImgBase64 = fileContents;
  };

  onStreamerNameChanged = (name) => {
    this.streamerName = name;
  };

  //### END Callbacks for Event's ###

  //### Checking functions
  onStreamerDataUpdated = () => {
    if(!this.ipfsNodeID)
      this.ipfsNodeID = this.ipfs.id;
    console.log("Try update streamer data by values: " + JSON.stringify([
      this.streamerName,
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
            if(readyData.isDataReady) {
                this.streamerInfo = readyData.streamInfo;
                console.log(`Ready streamer info: \n ${JSON.stringify(this.streamerInfo)}`);
                const streamInfoDecorated = jsonHelper.simplifyStringifyValue(streamInfoArray);
                console.log(`Streamer info updated! Values: \n ${streamInfoDecorated}`);
            }
    }).catch(err => {
      throw err;
    })
  };

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