const appConfig = require('../../appFilesConfig');
const dataConverter = require('../helpers/dataConverters.js');
const fsExtra = require('fs-extra');
const EventEmitter = require('events').EventEmitter;
const pathModule = require('path');

//constants
const USER_DATA_PATH = appConfig.folders.USER_DATA_PATH;
const STREAMERS_JSON_FILE = 'streamers.json';
const STREAMERS_DATA_PATH = pathModule.join(USER_DATA_PATH.toString(), STREAMERS_JSON_FILE);
const STREAMERS_INFO_DATA_PATH = pathModule.join(USER_DATA_PATH.toString(), 'streamers');

class StreamersDataEvent extends EventEmitter {}

class StreamersDataHandler {
    constructor(ipfs, globalRoomListener) {
        this.ipfs = ipfs;
        this.globalRoomListener = globalRoomListener;
        this.dataEvent = new StreamersDataEvent();
        this.dataEvent.setMaxListeners(0);

        //clear data firstable
        this.clearStreamersData().then(() => {
            this.createUserFilesIfNotExists();
            this.initializeListenersForRooms();
        });
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

    initializeListenersForRooms() {
        try {
            this.globalRoomListener.getOnStreamDataRecievedEvent().on('message_recieved', (msg) => {
                if(!super.isEnabled()) {
                    return;
                }
                const messageStr = msg.data.toString();
                console.log(`Message getted: \n from: ${msg.from} \n `);
                this.onStreamerInfoMessageGetted(messageStr)
                    .then((streamerInfoObj) => {
                        //Do something with streamer when it saved.
                        //globalRoomPageObj.updatePageAboutStreamers();
                    })
                    .catch((err) => {
                        console.log(`Unable parse streamer message: ${messageStr.substr(0, 50)} to JSON! ERROR: \n ${err.message}`);
                    });
            });
        } catch(err) {
            console.error(`Error when listeners initialized! ${err.message}`);
        }
    }
    onStreamerInfoMessageGetted(streamerMessage) {
        //save stream info in JSON file data
        try {
            const streamerInfoObj = this.tryParseStreamerInfo(streamerMessage);
            if(streamerInfoObj != null) {
                return this.saveStreamerInfoInLocalFileIfItNotExistsAsync(streamerInfoObj);
            } else {
                console.err("unable to handle streamer with message " + streamerMessage.substr(0, 25) + " is null!");
            }
        } catch(err){
            console.err(`Unable handle streamer message! : ${err.message}`);
        }
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
                    this.isStreamerInfoAlreadyExistsInfo(fileData, streamerInfoJson);

                if(isStreamerExists === true) {
                    //update watchers count if streamer already exists
                    try {
                        const streamersArray = JSON.parse(fileData);
                        const founded = streamersArray.find(streamer => streamer.hashOfStreamer === streamerInfoJson.hashOfStreamer);

                        if(founded) {
                            //check watchersCount fields was changed, if true so no need to update file..
                            if(founded.watchersCount === streamerInfoJson.watchersCount) {
                                resolve();
                            }

                            founded.watchersCount = streamerInfoJson.watchersCount;
                            //write in file
                            fs.writeFile(STREAMERS_DATA_PATH, JSON.stringify(streamersArray), (err) => {
                                if(err)
                                    rejected(err);
                                this.dataEvent.emit('dataChanged');
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
                        this.dataEvent.emit('dataChanged');
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

module.exports = StreamersDataHandler;