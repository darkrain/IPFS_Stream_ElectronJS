//imports
const Room = require('ipfs-pubsub-room');
const pathModule = require('path');
const appRootPath = require('app-root-path');
const fs = require('fs');

//constants
const GLOBAL_ROOM_NAME = 'borgStream';
const STREAMERS_JSON_FILE = 'streamers.json';
const STREAMERS_DATA_PATH = pathModule.join(appRootPath.toString(), 'user', 'userData', STREAMERS_JSON_FILE);

class GlobalRoomPage {
    constructor(ipfs, ipc, win) {
        this.ipfs = ipfs;
        this.ipc = ipc;
        this.win = win;

        this.globalRoom = Room(this.ipfs, GLOBAL_ROOM_NAME);
        this.initializeListenersForRooms();

        this.currentStreamers = [];
    }

    initializeListenersForRooms() {
        this.globalRoom.on('subscribed', () => {
            console.log(`Subscribed to ${GLOBAL_ROOM_NAME}!`);
        });
        this.globalRoom.on('message', (msg) => {
            console.log(`Message getted: \n from: ${msg.from} \n data: ${msg.data}`);
        })
    }

    tryParseStreamerInfo(infoMsg) {
        try {
            const streamerInfo = JSON.parse(infoMsg);

        } catch(err) {
            console.error(`Unable to parse string from room!! \n${err.name} \n${err.message} \n${err.stack} `);
        }
    }

    async saveStreamerInfoInLocalFileIfItNotExists(streamerInfoJson) {
        const globalRoomPageObj = this;
        //find if file already exists
        await new Promise((resolve, rejected) => {
            if(fs.existsSync(STREAMERS_DATA_PATH)) {
                //read file
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
                        //if streamer not exist write info about him in file
                        fileData += JSON.stringify(streamerInfoJson);
                        fs.writeFile(STREAMERS_DATA_PATH, fileData, (err) => {
                            if(err) {
                                console.error("Unable to save streamer in existsing file! \n" + err);
                                rejected(err);
                            }
                            console.log("Streamer saved in file!");
                            resolve();
                        });
                    }
                });
            } else {
                //create file and write data
                globalRoomPageObj.currentStreamers.push(streamerInfoJson);
                const streamersArrayJson = JSON.stringify(globalRoomPageObj.currentStreamers);
                fs.writeFile(STREAMERS_DATA_PATH, streamersArrayJson, (err) => {
                    if(err) {
                        console.err("Unable to create json streamers data file ! \n " + err.toString());
                        rejected(err);
                    }
                    console.log("new data file created! Streamer saved!");
                    resolve();
                });
            }
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
            return false;
        }
    }
}

module.exports = GlobalRoomPage;