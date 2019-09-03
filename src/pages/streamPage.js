const STREAM_PAGE_LINK = 'front/streamerPage/index.html'

const IPFS = require('ipfs')
const { app, BrowserWindow } = require('electron');
const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;
const StreamInitializer = require('../stream/streamInitializer.js');
const pathModule = require('path');

//External helpers
const imgHelper = require('../helpers/imageLoaderHelper.js');
const dataReadyHelper = require('../helpers/dataReadyCheckHelper.js');
const StreamInfoGenerator = require('../data/StreamerInfoGenerator.js');
//Streamer data fields
let streamerName;
let ipfsNodeID;
let streamerImgPath;

const ipfs = new IPFS({
	repo: 'ipfs/pubsub-demo/borgStream',
	EXPERIMENTAL: {
	  pubsub: true
	},
	config: {
	  Addresses: {
		Swarm: [
		  "/ip4/0.0.0.0/tcp/5001",
		]
	  }
	},
})

ipfs.on('ready', () => {
	ipfs.id((err, id) => {	
		if (err) {
			return console.log(err)
		} else {
      console.log("YOUR NODE ID : " + id);
    }
	})

})
	

ipfs.on('error', (err) => {
	return console.log(err)
})


ipfs.once('ready', () => ipfs.id((err, peerInfo) => {
	if (err) { throw err }

  console.log('IPFS node started and has ID ' + peerInfo.id)
  onIpfsNodeIDGetted(peerInfo.id);
}))


//Initializers
let streamInitializer = new StreamInitializer(ipfs);
let streamInfoGenerator;

//### IPC calls ###
ipc.on('update-stream-state', function (event, arg) {
  if( arg == 'start' ){  
  	streamInitializer.startStream(onPlaylistRelativePathUpdated);
  	win.webContents.send('streamState', 'started')
  }

  if( arg == 'stop' ){  
    streamInitializer.stopStream();
    streamInitializer.resetStream();
  	win.webContents.send('streamState', 'stoped')
  }
})

ipc.on('camera-changed', (event, args) => {
  const camText = args;
  streamInitializer.setCameraByName(camText);
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
          onAvaImageUploaded(copiedImgPath);
      })};
    })
    .catch(err => {
      console.err(err);
    });
});

ipc.on('streamerNameChanged', (event, args) => {
    onStreamerNameChanged(args);
});
//### END IPC calls ###

//### Anothers event calls
//### END Anothers event calls

//### Callbacks for Events's ###
function onAvaImageUploaded(filePath) {
    streamerImgPath = filePath;
    onStreamerDataUpdated();
}

function onIpfsNodeIDGetted(nodeID) {
    ipfsNodeID = nodeID;
    onStreamerDataUpdated();
}

function onStreamerNameChanged(name) {
    streamerName = name;
    onStreamerDataUpdated();
}

function onStreamerDataUpdated() {
    if(!ipfsNodeID)
        ipfsNodeID = ipfs.id;
    console.log("Try update streamer data by values: " + JSON.stringify([streamerName, streamerImgPath, ipfsNodeID]));
    if(streamerName && streamerImgPath && ipfsNodeID) {
        streamInfoGenerator = new StreamInfoGenerator(ipfsNodeID, streamerName, streamerImgPath);       
    }
    checkAllData();
}

function onMainPageLoaded() {
  console.log("MAIN PAGE LOADED!");

  //checkData is ready first run
  checkAllData();
}

function onPlaylistRelativePathUpdated() {
    const videoPath = streamInitializer.getLastFullVideoPath(); 
    console.log("Relative path for videos updated!: " + videoPath);
    win.webContents.send('video-playlist-path-changed', videoPath);
}

//### END Callbacks for Event's ###

//### Checking functions
function checkAllData(){
  dataReadyHelper.checkDataIsReadyAsync(ipfs, win, streamInitializer, streamInfoGenerator).then((isReady) => {
    console.log("Data checking... result: " + isReady);
    win.webContents.send('all-data-ready', isReady);

    //update front page by streamer info array
    const streamerNameInfo = streamerName ? streamerName : "empty";
    const streamerImgPathInfo = streamerImgPath ? streamerImgPath : "empty";
    const ipfsNodeIdInfo = ipfsNodeID ? ipfsNodeID : "empty";
    const streamInfoArray = {
      "StreamerName": streamerNameInfo,
      "AvatarHash": streamerImgPathInfo,
      "IPFS_NodeID": ipfsNodeIdInfo
    };

    win.webContents.send('update-requirements', streamInfoArray);
  });
}
//### End Checking functions

let win
function createWindow () {
  // Создаём окно браузера.
  win = new BrowserWindow({
    width: 1280,
    height: 768,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile(STREAM_PAGE_LINK).then(() => {
      onMainPageLoaded();
  });

  // Отображаем средства разработчика.
  win.webContents.openDevTools()

  // Будет вызвано, когда окно будет закрыто.
  win.on('closed', () => {
    // Разбирает объект окна, обычно вы можете хранить окна     
    // в массиве, если ваше приложение поддерживает несколько окон в это время,
    // тогда вы должны удалить соответствующий элемент.
    win = null
  }) 
}

app.on('ready', createWindow)

// Выходим, когда все окна будут закрыты.
app.on('window-all-closed', () => {
  // Для приложений и строки меню в macOS является обычным делом оставаться
  // активными до тех пор, пока пользователь не выйдет окончательно используя Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
   // На MacOS обычно пересоздают окно в приложении,
   // после того, как на иконку в доке нажали и других открытых окон нету.
  if (win === null) {
    createWindow()
  }
})

//Handle uncaught exceptions
process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });