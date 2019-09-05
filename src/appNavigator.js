//*** Imports ***
const { app, BrowserWindow } = require('electron');
const ipfsLoaderHelper = require('./helpers/ipfsLoaderHelper.js');
const ipc = require('electron').ipcMain;

//pages scripts
const StreamPage = require('./pages/streamPage.js');
const UserInfoPage = require('./pages/userInfoPage.js');
const GlobalRoomPage = require('./pages/globalRoomPage.js');
//*** End Imports ***

//*** Page links ***
const USER_INFO_PAGE_LINK = 'front/userInfoPage/index.html';
const GLOBAL_ROOM_PAGE_LINK = 'front/globalRoomPage/index.html';
const STREAM_PAGE_LINK = 'front/streamerPage/index.html';
//*** End page links 

//*** Named constants ***
const USER_INFO_PAGE = 'userInfoPage';
const STREAMING_PAGE = 'streamingPage';
const GLOBAL_ROOM_PAGE = 'globalRoomPage';

const DEFAULT_PAGE = GLOBAL_ROOM_PAGE;
//*** End Named constants ***

let IpfsInstance;
let IpfsNodeID;
let currentWindow;

function InitializeApp() {
    //firstable initialize IPFS instance
    ipfsLoaderHelper.initializeIPFS_Async()
        .then((ipfsInstance, nodeID) => {
            console.log("Try to initialize IPFS instance...");
            IpfsInstance = ipfsInstance;
            IpfsNodeID = nodeID;    
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

function loadPageByName(pageName)  {
    console.log("Start loading page: " + pageName + "....");
    switch(pageName) {       
        case USER_INFO_PAGE: {
            createWindowAsync(USER_INFO_PAGE_LINK).then((win) => {
                let userInfoPage = new UserInfoPage(ipc);
            });
            break;
        }
        case STREAMING_PAGE: {
            createWindowAsync(STREAM_PAGE_LINK).then((win) => {
                let streamPage = new StreamPage(IpfsInstance, IpfsNodeID, ipc, win);        
            });
            break;
        }
        case GLOBAL_ROOM_PAGE: {
            createWindowAsync(GLOBAL_ROOM_PAGE_LINK).then((win) => {
                let globalRoomPage = new GlobalRoomPage(IpfsInstance, ipc);
            });
            break;
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


//nav functions
ipc.on('goto-page', (event, args) => {
    loadPageByName(args);
});
  
//Handle uncaught exceptions
process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
        process.exit(1);
    });