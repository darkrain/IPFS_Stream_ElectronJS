//*** Imports ***
const { app, BrowserWindow } = require('electron');
const ipfsLoaderHelper = require('./helpers/ipfsLoaderHelper.js');
const ipc = require('electron').ipcMain;
const GlobalRoomListener = require('./helpers/globalRoomListener.js');

//pages scripts
const StreamPage = require('./pages/streamPage.js');
const UserInfoPage = require('./pages/userInfoPage.js');
const GlobalRoomPage = require('./pages/globalRoomPage.js');
const StreamWatchPage = require('./pages/streamWatchPage.js');
const StreamerInfoPage = require('./pages/streamInfoPage.js');
//*** End Imports ***

//*** Page links ***
const FRONT_LAYOUT_FILE_NAME = 'index.html';
const FRONTEND_FOLDER_NAME = 'front';
function getPageLinkByName(pageFolderName) {
    return `${FRONTEND_FOLDER_NAME}/${pageFolderName}/${FRONT_LAYOUT_FILE_NAME}`;
}

const USER_INFO_PAGE_LINK = getPageLinkByName('userInfoPage');
const GLOBAL_ROOM_PAGE_LINK = getPageLinkByName('globalRoomPage');
const STREAM_PAGE_LINK = getPageLinkByName('streamerPage');
const STREAMWATCH_PAGE_LINK = getPageLinkByName('streamWatchPage');
const STREAMERINFO_PAGE_LINK = getPageLinkByName('streamInfoPage');
//*** End page links 

//*** Named constants ***
const USER_INFO_PAGE = 'userInfoPage';
const STREAMING_PAGE = 'streamingPage';
const GLOBAL_ROOM_PAGE = 'globalRoomPage';
const STREAM_WATCH_PAGE = 'streamWatchPage';
const STREAMER_INFO_PAGE = 'streamerInfoPage';

const DEFAULT_PAGE = USER_INFO_PAGE;
//*** End Named constants ***

let IpfsInstance;
let IpfsNodeID;
let currentWindow;
let globalRoomListener;
function InitializeApp() {
    //firstable initialize IPFS instance
    ipfsLoaderHelper.initializeIPFS_Async()
        .then((ipfsInstance, nodeID) => {
            console.log("Try to initialize IPFS instance...");
            IpfsInstance = ipfsInstance;
            IpfsNodeID = nodeID;    
            globalRoomListener = new GlobalRoomListener(IpfsInstance);
        })
        .catch((error) => {
            if(error) {
                console.error("Unable initialize IPFS! \n" + error);
                throw error;
            }
        })
        .then(() => {
            console.log("Try to initialize Electron...");
            onAppInitialized();
        });
}

//Calls when the app and dependencies already initialized
function onAppInitialized() {
    loadDefaultPage();   
}

function loadDefaultPage() {
    loadPageByName(DEFAULT_PAGE);
}
let _currentPage;
async function loadPageByName(pageName, args)  {

    //disable currentPage, if its open
    if(_currentPage) {
        console.log("Stop last page: " + _currentPage.constructor.name);
        await Promise.resolve(_currentPage.stop());
    }
    resetAppData(); //this function reset all data listeners from another objects, so memory leak is decreasing...

    console.log("Start loading page: " + pageName + "....");
    switch(pageName) {       
        case USER_INFO_PAGE: {
            createWindowAsync(USER_INFO_PAGE_LINK).then((win) => {
                _currentPage = new UserInfoPage(ipc, win);
            });
            break;
        }
        case STREAMING_PAGE: {
            const streamArgs = args;
            const streamerInfo = args.streamerInfo;
            const streamInitializer = args.streamInitializer;
            if(!streamerInfo) {
                throw new Error(`Unable to start stream page, streamer info is NULL!!!`);
            }
            if(!streamInitializer) {
                throw new Error(`Unable to start stream page, streamInitializer is NULL!!!`);
            }
            createWindowAsync(STREAM_PAGE_LINK).then((win) => {
                _currentPage = new StreamPage(streamInitializer, win, ipc, streamerInfo);        
            });
            break;
        }
        case GLOBAL_ROOM_PAGE: {
            createWindowAsync(GLOBAL_ROOM_PAGE_LINK).then((win) => {
                _currentPage = new GlobalRoomPage(IpfsInstance, ipc, win, globalRoomListener);
            });
            break;
        }
        case STREAM_WATCH_PAGE: {
            createWindowAsync(STREAMWATCH_PAGE_LINK).then((win => {
                const streamerInfo = args;
                _currentPage = new StreamWatchPage(IpfsInstance, ipc, win, streamerInfo);
            }));
            break;
        }
        case STREAMER_INFO_PAGE: {
            createWindowAsync(STREAMERINFO_PAGE_LINK).then((win) => {
                _currentPage = new StreamerInfoPage(IpfsInstance, IpfsNodeID, ipc, win);
            });
            break;
        }
        default: {
            throw new Error(`FATAL_ERROR! \n Page ${pageName} in not EXISTS!`);
        }
    }
}

function createWindowAsync(linkToPage) {
    return new Promise((resolve, rejected) => {
        // Создаём окно браузера.
        if(!currentWindow) {
            currentWindow = new BrowserWindow({
                width: 1280,
                height: 768,
                frame: false,
                webPreferences: {
                    nodeIntegration: true
                }
            });           
        }
               
        // and load the index.html of the app.
        currentWindow.loadFile(linkToPage).then(() => {
            console.log("INITIALIZE WINDOW BY PAGE: " + linkToPage);
            resolve(currentWindow);
        }).catch((err) => {
            rejected(err);
        });
        
        // Отображаем средства разработчика.
        currentWindow.webContents.openDevTools()
        
        // Будет вызвано, когда окно будет закрыто.
        currentWindow.on('closed', () => {
            // Разбирает объект окна, обычно вы можете хранить окна     
            // в массиве, если ваше приложение поддерживает несколько окон в это время,
            // тогда вы должны удалить соответствующий элемент.
            currentWindow = null
        })        
    });
}
  
app.on('ready', InitializeApp);
  
// Выходим, когда все окна будут закрыты.
app.on('window-all-closed', () => {
    // Для приложений и строки меню в macOS является обычным делом оставаться
    // активными до тех пор, пока пользователь не выйдет окончательно используя Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  
app.on('activate', () => {
     // На MacOS обычно пересоздают окно в приложении,
     // после того, как на иконку в доке нажали и других открытых окон нету.
    //if (currentWindow === null) {
        //createWindowAsync()
    //}
  });

function resetAppData() {
    console.log("APP_NAVIGATOR: Reseting all app data.");
    clearAllIPCListeners();
    clearIPFSListeners();
    updateNavIpcFunctions(); 
}

//nav functions
function updateNavIpcFunctions() {
    ipc.on('goto-page', (event, args) => {
        const pageName = args.pageName;
        const pageArgs = args.pageArgs;
        loadPageByName(pageName, pageArgs);
    });
}

function clearIPFSListeners() {
    if(IpfsInstance) {
        IpfsInstance.removeAllListeners();
    }
}

function clearAllIPCListeners() {
    ipc.removeAllListeners();
}


function isPromise(object){
    if(Promise && Promise.resolve){ 
      return Promise.resolve(object) == object;  
    }else{
      throw "Promise not supported in your environment"
    } 
  }

//Handle uncaught exceptions
process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
        process.exit(1);
    });
process.setMaxListeners(0);

module.exports.loadPageByName = loadPageByName;
module.exports.loadDefaultPage = loadDefaultPage;