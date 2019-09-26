//imports
const Room = require('ipfs-pubsub-room');
const pathModule = require('path');
const appRootPath = require('app-root-path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const dataConverter = require('../helpers/dataConverters.js');
const streamersMonitor = require('../data/streamersMonitor.js');
const PageBase = require('./pageBase');
const appConfig = require('../../appFilesConfig');

//constants
const USER_DATA_PATH = appConfig.folders.USER_DATA_PATH;
const STREAMERS_JSON_FILE = 'streamers.json';
const STREAMERS_DATA_PATH = pathModule.join(USER_DATA_PATH.toString(), STREAMERS_JSON_FILE);
const STREAMERS_INFO_DATA_PATH = pathModule.join(USER_DATA_PATH.toString(), 'streamers');

class GlobalRoomPage extends PageBase {
    constructor(ipfs, ipc, win, globalRoomListener) {
        super();
        const globalRoomObj = this;
        
        this.createUserFilesIfNotExists();
        this.clearStreamersData().then(() => {
            globalRoomObj.initialize(ipfs, ipc, win, globalRoomListener);
        }); //firstable clean data
        
    }

    createUserFilesIfNotExists() {
        if(!fs.existsSync(USER_DATA_PATH)) {
            fs.mkdirSync(USER_DATA_PATH);
        }
        if(!fs.existsSync(STREAMERS_INFO_DATA_PATH)) {
            fs.mkdirSync(STREAMERS_INFO_DATA_PATH);
        }
        if(!fs.existsSync(STREAMERS_DATA_PATH)) {
            fs.writeFileSync(STREAMERS_DATA_PATH, '[]');
        }
    }

    initialize(ipfs, ipc, win, globalRoomListener) {
        this.ipfs = ipfs;
        this.ipc = ipc;
        this.win = win;
        this.globalRoomListener = globalRoomListener;
        this.initializeListenersForRooms();

        this.currentStreamers = [];

        this.updatePageAboutStreamers();
    }

    initializeListenersForRooms() {
        try {
            const globalRoomPageObj = this;
            this.globalRoomListener.getOnStreamDataRecievedEvent().on('message_recieved', (msg) => {
                if(!super.isEnabled()) {
                    return;
                }
                const messageStr = msg.data.toString();
                console.log(`Message getted: \n from: ${msg.from} \n `);
                globalRoomPageObj.onStreamerInfoMessageGetted(messageStr)
                    .then((streamerInfoObj) => {                 
                        //Do something with streamer when it saved.  
                        globalRoomPageObj.updatePageAboutStreamers();      
                    })
                    .catch((err) => {
                        throw err;
                    });
            });
        } catch(err) {
            throw err;
        }      
    }

    onStreamerInfoMessageGetted(streamerMessage) {
        //save stream info in JSON file data
        const globalRoomPageObj = this;
        return new Promise((resolve, rejected) => {
            const streamerInfoObj = globalRoomPageObj.tryParseStreamerInfo(streamerMessage);          
            if(streamerInfoObj != null) {
                globalRoomPageObj.saveStreamerInfoInLocalFileIfItNotExistsAsync(streamerInfoObj)
                    .then(() => {
                        resolve(streamerInfoObj);
                    }).catch((err) => {
                        rejected(err);
                    });
            } else {
                rejected(new Error("unable to handle streamer with message " + streamerMessage + " is null..."));
            }
        });
    }

    tryParseStreamerInfo(infoMsgEncoded) {
        try {
            const parsed = dataConverter.convertBase64DataToObject(infoMsgEncoded);          
            console.log("Parsed!");
            console.log("Name: \n" + parsed.nameOfStream);

            return parsed;

        } catch(err) {
            console.error(`Unable to parse string from room!! \n${err.name} \n${err.message} \n${err.stack} `);
            return null;
        }
    }

    async saveStreamerInfoInLocalFileIfItNotExistsAsync(streamerInfoJson) {
        const globalRoomPageObj = this;
        await new Promise((resolve, rejected) => {
            //create jsonArray if its not exists
            if(!fs.existsSync(STREAMERS_DATA_PATH)) {
                fs.writeFile(STREAMERS_DATA_PATH, "[]", (err) => {
                    if(err) {                      
                        rejected(err);
                    }
                    resolve();
                });
            }
            else {
                resolve(); //if dataJSON file already exists just skip.
            }
        }).catch((err) => { 
            console.error("Unable to create json streamers data file ! \n " + err.toString()); 
            throw err;
        });
        //find if file already exists
        await new Promise((resolve, rejected) => {
            fs.readFile(STREAMERS_DATA_PATH,'utf8', (err, data) => {
                let fileData = data;
                if(err) {
                    console.log(`Unable to read file! ` + err);
                    throw err;
                }
                console.log("Save streamer info watch count: " + streamerInfoJson.watchersCount);
                const isStreamerExists = 
                    globalRoomPageObj.isStreamerInfoAlreadyExistsInfo(fileData, streamerInfoJson);

                if(isStreamerExists === true) {
                    //update watchers count if streamer already exists
                    try {
                        const streamersArray = JSON.parse(fileData);
                        const founded = streamersArray.find(streamer => streamer.hashOfStreamer === streamerInfoJson.hashOfStreamer);
                        if(founded) {
                            founded.watchersCount = streamerInfoJson.watchersCount;
                            //write in file
                            fs.writeFile(STREAMERS_DATA_PATH, JSON.stringify(streamersArray), (err) => {
                                if(err)
                                    rejected(err);
                                resolve();
                            });
                        }
                    } catch(err) {
                        rejected(err);
                    }
                } else {       
                    let fileDataInJsonArray = JSON.parse(fileData);                
                    //if streamer not exist write info about him in file
                    fileDataInJsonArray.push(streamerInfoJson);
                    fs.writeFile(STREAMERS_DATA_PATH, JSON.stringify(fileDataInJsonArray), (err) => {
                        if(err) {
                            console.error("Unable to save streamer in existsing file! \n" + err);
                            rejected(err);
                        }
                        console.log("Streamer saved in file!");
                        resolve();
                    });
                }
            });
        }).catch((err) => {
            console.error("cannot save streamer... coz: \n" + err.toString());
            throw err;
        });
    }

    isStreamerInfoAlreadyExistsInfo(streamersJsonSTR, streamerInfoJson) {
        try {
            const searchedStreamName = streamerInfoJson.nameOfStream;
            const searchedStreamHash = streamerInfoJson.hashOfStreamer;
            
            const streamersArr = JSON.parse(streamersJsonSTR);
            for(let i = 0; i < streamersArr.length; i++) {
                let streamer = streamersArr[i];
                const streamName = streamer.nameOfStream;
                const streamHash = streamer.hashOfStreamer;
                if(searchedStreamName === streamName && searchedStreamHash === streamHash) {
                    console.log(`Streamer with name: ${streamName} already exists in data!`);
                    return true;
                }
            }
            console.log(`Streamer with name ${searchedStreamName} not exists, saved...`);
            return false;
        } catch(err) {
            console.error("Unable to parse streamers info array! \n" + err.toString());
            throw err;
        }
    }

    updatePageAboutStreamers() {
        const globalRoomObj = this;
        streamersMonitor.getStreamersDataAsync(this.ipfs).then((streamersArray) => {
            console.log("Streamers array updated! \n ");
            globalRoomObj.win.webContents.send('listOfStreamersUpdated', streamersArray);
        }).catch(err => {
            throw err;
        });
    }

    async clearStreamersData() {
        //TODO: Realize cleaning streamers data before work
        try {
            //cleanDataJson
            await new Promise((resolve, rejected) => {
                const emptyData = '[]';
                fs.writeFile(STREAMERS_DATA_PATH, emptyData, (err) => {
                    if(err) {
                        rejected(err);
                    }
                    resolve();
                });
            });

            await new Promise((resolve, rejected) => {
                    fsExtra.emptyDir(STREAMERS_INFO_DATA_PATH)
                        .then(() => resolve())
                        .catch((err) => rejected(err));
                });

        } catch(err) {
            console.error("Cannot clean streaming data: \n" + err.toString());
        }
        
    }
}

module.exports = GlobalRoomPage;