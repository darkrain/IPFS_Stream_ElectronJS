//*** Imports ***
const { app, BrowserWindow } = require('electron');
const ipfsLoaderHelper = require('./helpers/ipfsLoaderHelper.js');
const ipc = require('electron').ipcMain;
//*** End Imports ***

//*** Page links ***
const STREAM_PAGE_LINK = 'front/streamerPage/index.html';
const VIEWER_INFO_PAGE_LINK = 'front/viewPage/index.html';
//*** End page links 

//*** Named constants ***
const VIEWER_INFO_PAGE = 'viewerInfoPage';
const STREAMING_PAGE = 'streamingPage';

const DEFAULT_PAGE = VIEWER_INFO_PAGE;
//*** End Named constants ***

let IpfsInstance;
let IpfsNodeID;
let currentWindow;


//*** Main initializing calls
InitializeApp();
//*** END intiializing calls

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
    switch(pageName) {       
        case VIEWER_INFO_PAGE: {
            createWindowAsync(VIEWER_INFO_PAGE_LINK).then((win) => {

            });
            break;
        }
        case STREAMING_PAGE: {
            createWindowAsync(STREAM_PAGE_LINK).then((win) => {

            });
            break;
        }
    }
}

function createWindowAsync(linkToPage) {
    return new Promise((resolve, rejected) => {
        // Создаём окно браузера.
        let win = new BrowserWindow({
            width: 1280,
            height: 768,
            frame: false,
            webPreferences: {
            nodeIntegration: true
            }
        })
        
        // and load the index.html of the app.
        win.loadFile(linkToPage).then(() => {
            resolve(win);
        }).catch((err) => {
            rejected(err);
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
    });
}
  
app.on('ready', loadDefaultPage);
  
// Выходим, когда все окна будут закрыты.
app.on('window-all-closed', () => {
    // Для приложений и строки меню в macOS является обычным делом оставаться
    // активными до тех пор, пока пользователь не выйдет окончательно используя Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  });
  
app.on('activate', () => {
     // На MacOS обычно пересоздают окно в приложении,
     // после того, как на иконку в доке нажали и других открытых окон нету.
    if (currentWindow === null) {
        createWindowAsync()
    }
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