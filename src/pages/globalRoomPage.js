//imports
const Room = require('ipfs-pubsub-room');
const pathModule = require('path');
const appRootPath = require('app-root-path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const dataConverter = require('../helpers/dataConverters.js');
const StreamerDataSaver = require('../data/streamerDataSaver.js');
const streamersMonitor = require('../data/streamersMonitor.js');

//constants
const USER_DATA_PATH = pathModule.join(appRootPath.toString(), 'user', 'userData');
const GLOBAL_ROOM_NAME = 'borgStream';
const STREAMERS_JSON_FILE = 'streamers.json';
const STREAMERS_DATA_PATH = pathModule.join(USER_DATA_PATH.toString(), STREAMERS_JSON_FILE);
const STREAMERS_INFO_DATA_PATH = pathModule.join(USER_DATA_PATH.toString(), 'streamers');

class GlobalRoomPage {
    constructor(ipfs, ipc, win) {
        const globalRoomObj = this;
        this.createUserFilesIfNotExists();
        this.clearStreamersData().then(() => {
            globalRoomObj.initialize(ipfs, ipc, win);
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

    initialize(ipfs, ipc, win) {
        this.ipfs = ipfs;
        this.ipc = ipc;
        this.win = win;
        this.dataSaver = new StreamerDataSaver(this.ipfs);
        this.globalRoom = Room(this.ipfs, GLOBAL_ROOM_NAME);
        this.initializeListenersForRooms();

        this.currentStreamers = [];

        this.updatePageAboutStreamers();
    }

    initializeListenersForRooms() {
        const globalRoomPageObj = this;
        this.globalRoom.on('subscribed', () => {
            console.log(`Subscribed to ${GLOBAL_ROOM_NAME}!`);
        });
        this.globalRoom.on('message', (msg) => {
            const messageStr = msg.data.toString();
            console.log(`Message getted: \n from: ${msg.from} \n data: ${msg.data}`);
            globalRoomPageObj.onStreamerInfoMessageGetted(messageStr)
                .then((streamerInfoObj) => {
                    //Do something with streamer when it saved.
                    globalRoomPageObj.dataSaver.saveStreamerDataAsync(streamerInfoObj).then((avaPath) => {
                        globalRoomPageObj.updatePageAboutStreamers();
                    });          
                })
                .catch((err) => {
                    console.error("Unable read streamer message! \n" + err.toString());
                });
        })
    }

    onStreamerInfoMessageGetted(streamerMessage) {
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
            console.log(`Try pars str: ${infoMsgEncoded}`);
            const parsed = dataConverter.convertBase64DataToObject(infoMsgEncoded);          
            console.log("Parsed!: \n" + parsed);
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
        });
        //find if file already exists
        await new Promise((resolve, rejected) => {
            fs.readFile(STREAMERS_DATA_PATH,'utf8', (err, data) => {
                let fileData = data;
                if(err) {
                    console.log(`Unable to read file! ` + err);
                    throw err;
                }

                let isStreamerExists = 
                    globalRoomPageObj.isStreamerInfoAlreadyExistsInfo(fileData,streamerInfoJson);

                if(isStreamerExists) {
                    resolve();
                } else {       
                    let fileDataInJsonArray = JSON.parse(fileData);                
                    //if streamer not exist write info about him in file
                    console.log("streamer info object: " + streamerInfoJson);
                    fileDataInJsonArray.push(streamerInfoJson);
                    console.log("Data info array now: \n " + JSON.stringify(fileDataInJsonArray));
                    console.log("File data length: " + fileDataInJsonArray.length);
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
                console.log(`Checking if ${JSON.stringify(streamer)} exists in data...`);
                if(searchedStreamName === streamName && searchedStreamHash === streamHash) {
                    console.log(`Streamer with name: ${streamName} already exists in data!`);
                    return true;
                }
            }
            console.log(`Streamer with name ${searchedStreamName} not exists, saved...`);
            return false;
        } catch(err) {
            console.error("Unable to parse streamers info array! \n" + err.toString());
            return false;
        }
    }

    updatePageAboutStreamers() {
        const globalRoomObj = this;
        streamersMonitor.getStreamersDataAsync().then((streamersArray) => {
            console.log("Streamers array updated! \n " + JSON.stringify(streamersArray));
            globalRoomObj.win.webContents.send('listOfStreamersUpdated', streamersArray);
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