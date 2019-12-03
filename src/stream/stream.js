const Room = require('ipfs-pubsub-room')
const fs = require('fs');	
const fsPath = require('path');
const IpfsStreamUploader = require('../helpers/ipfsStreamUploader.js');
const StreamRoomBroadcaster = require('../stream/streamRoomBroadcaster.js');
const dialogErrorHelper = require('../helpers/dialogErrorHelper');
const pathModule = require('path');
const getVideoInfo = require('get-video-info');
const logger = require('../data/logger');
const appConfig = require('../../appFilesConfig');
class Stream {

	constructor(ipfs, nameOfStreem, path, ffmpegRecorder) {
		console.log(`Try initialize sream with fields: \n ${ipfs} \n ${nameOfStreem}`);
		this.ipfs = ipfs;
		this.ipfsStreamUploader = new IpfsStreamUploader(this.ipfs);
		this.ipfsready = false;
		this.headers = '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:8\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:EVENT\n';
		this.blocks = [];
		this.rooms = {};
		this.keepPath = path;
		this.keep =  pathModule.join(this.keepPath, 'master.m3u8');
		this.nameOfStreem = nameOfStreem;
		this.m3u8IPFS = pathModule.join(this.keepPath, 'streamIPFS.m3u8');
		this.isPlalistInitialized = false;
		this.ffmpegRecorder = ffmpegRecorder;		

		this.currentVideoChunkID = 0;

		if (!fs.existsSync(this.keepPath))
			fs.mkdirSync(this.keepPath);		    
		
		this.createRooms();	
	}

	getInstance = () => { 
		return this;
	}


	ffmpeg(debug){		
		const streamObj = this.getInstance();
		console.log('send stream to '+ this.keepPath);	
		this.ffmpegProc = this.ffmpegRecorder.startRecord();
		console.log()
		const ffmpegProcess = this.ffmpegProc;
		ffmpegProcess.removeAllListeners();
		ffmpegProcess.setMaxListeners(0);
		ffmpegProcess.on('error', (err) => {
			console.error("FFmpeg process ERROR! \n");
			ffmpegProcess.kill();
			logger.printErr(err);
			throw err;
		});
		
		ffmpegProcess
			.stderr.addListener('data', (data) => {
				const dataString = data.toString();
				streamObj.checkFFmpegDataForError(dataString)
					.then(() => {
						if(debug === true) {
							console.log(`FFMPEG data! \n ${dataString}`);
						}
					}).catch((err) => {
						dialogErrorHelper.showErorDialog('FFMPEG ERROR', err.message, true);
					});				
			});
	}

	checkFFmpegDataForError(ffmpegData) {
		const streamObj = this;
		return new Promise((resolve, reject) => {
			const output = ffmpegData.toLowerCase();
			if( output.includes('error') || output.includes('failed')){
				console.log('Try again');
				streamObj.ffmpegProc.kill();
				reject(new Error("ERROR in CODEC! Check yor device. Log: \n" + ffmpegData));
			}
			resolve();
		});
	}
	createRooms(){
		const streamObj = this.getInstance();
		const globalRoomName = 'borgStream';

		let rooms = [globalRoomName, this.nameOfStreem];
		
		for (var i = 0; i < rooms.length; i++) {
			let nameRoom = rooms[i];
			streamObj.rooms[nameRoom] = Room(streamObj.ipfs, nameRoom);
			streamObj.rooms[nameRoom].setMaxListeners(0);
			streamObj.rooms[nameRoom].removeAllListeners();
		}	
	}


	uploadM3U8() {
		const streamObj = this.getInstance();
		let output = this.headers;
		for( const [key, value] of Object.entries(this.blocks) ){
			output += value;

		}
		output += '#EXT-X-ENDLIST\n';
	    fs.writeFile(this.m3u8IPFS, output, function(err) {
			streamObj.ipfs.addFromFs(streamObj.m3u8IPFS, (err, result) => {
			  if (err) {
			  	logger.printErr(err);
			  	throw err;
			  }

			  	let data = {
			  		live : streamObj.ipfsID+"/"+streamObj.nameOfStreem
			  	};
			  	streamObj.rooms.borgStream.broadcast(JSON.stringify(data));
			  	streamObj.rooms[streamObj.nameOfStreem].broadcast(JSON.stringify(result));
			})	
	    }); 		
	}

	getRooomBroadcaster() {
		return this.roomBroadcaster;
	}
	
	start(onPlaylistReadyCallback, streamerInfo) {
		this.isPlalistInitialized = false;		
		this.getInstance().ffmpeg(false);
		this.getInstance().streamWatcher(onPlaylistReadyCallback);

		this.roomBroadcaster = new StreamRoomBroadcaster(this.ipfs, streamerInfo);
		this.roomBroadcaster.startBroadcastAboutStream();
		console.log("*** STREAM STARTED ****");
	}

	streamWatcher(onPlaylistChangedCallback) {
		let isStreamInitialized = this.isPlalistInitialized;
		const streamObj = this.getInstance();
		streamObj.watcherPID = fs.watch(this.keepPath, (evt, name) => {
			const fileName = fsPath.basename(name);
			const playlistName = 'master.m3u8';
			let isPlaylist = fileName === playlistName;

			if(isPlaylist && isStreamInitialized === false) {
				console.log("Playlist updated!");
				if(onPlaylistChangedCallback)
					onPlaylistChangedCallback();
				isStreamInitialized = true;
			}	

			if(evt === 'change') {
				this.handleVideoChunkAsync(name);
			}
		});
		streamObj.watcherPID.setMaxListeners(0);
	}

	async handleVideoChunkAsync(fileName) {
		try {
			if(!fileName.includes('.ts')) //Handle only video chunks
				return;
			const baseName = fileName.replace('master', '');
			const numberStr = baseName.replace('.ts', '');
			const number = Number(numberStr);
			if(this.currentVideoChunkID !== number) {
				console.log(`Chunk with id ${number} not defined in currentVideoChunkID! Return from handle chunk...`);
				return;
			}
			const filePath = pathModule.join(this.keepPath, fileName);
			const videoInfo = await getVideoInfo(filePath, appConfig.files.FFPROBE);
			const videoDuration = videoInfo.format.duration;
			const chunkData = {
				EXTINF: `EXTINF:${videoDuration}`,
				FILE_NAME: fileName
			};
			const buffer = fs.readFileSync(filePath);
			this.ipfs.add(buffer, (err, result) => {
				if (err) {
					logger.printErr(err);
					throw err;
				}
				const chunkHash = result[0].hash;
				console.log(`Chunk uploaded with result: \n${JSON.stringify((result))}`);
				//create block in DAG
				this.ipfsStreamUploader.addChunkToIpfsDAGAsync(fileName,chunkData.EXTINF,chunkHash)
					.then(async (streamBlock) => {
						try {
							await this.roomBroadcaster.updateLastStreamBlockAsync(streamBlock); //update last block data in global room broadcaster
							this.roomBroadcaster.startBroadcastAboutStreamBlock(streamBlock);
						} catch(err) {
							throw err;
						}
					})
					.catch((err) => {
						logger.printErr(err);
						throw err;
					});
			});

			this.currentVideoChunkID++;

		} catch(err) {
			console.error(`Unable handle chunk upload from stream: ${err.message}`);
			logger.printErr(err);
		}
	}

	stop() {
		this.isPlalistInitialized = false;
		if(this.ffmpegProc) {
			this.ffmpegProc.kill();
			this.ffmpegProc.removeAllListeners();
			this.ffmpegProc = null;
		}
						
		if( this.watcherPID ) {
			this.watcherPID.close();
			this.watcherPID = null;
		}
			
		if(this.roomBroadcaster) {
			this.roomBroadcaster.stopBroadcastAboutStream();
			this.roomBroadcaster = null;
		}
		this.blocks = [];
	}
}

module.exports = Stream;