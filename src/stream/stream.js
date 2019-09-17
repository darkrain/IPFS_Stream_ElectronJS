const spawn = require('child_process').spawn;
 
//let camera = '/dev/video0';
//let fileName = 'master';
const Room = require('ipfs-pubsub-room')
const watch = require('node-watch');
const fs = require('fs');	
const md5 = require('md5');	 
const ls = require('ls');
const fsPath = require('path');
const cameraHelper = require('../helpers/ffmpegCameraHelper');
const audioHelper = require('../helpers/ffmpegAudioHelper');
const IpfsStreamUploader = require('../helpers/ipfsStreamUploader.js');
const StreamRoomBroadcaster = require('../stream/streamRoomBroadcaster.js');
const appConfig = require('../config/appFilesConfig.js');
const dialogErrorHelper = require('../helpers/dialogErrorHelper');
class Stream {

	constructor(ipfs, nameOfStreem, path = 'videos', binFolderPath) {
		console.log(`Try initialize sream with fields: \n ${ipfs} \n ${nameOfStreem} \n ${binFolderPath}`);
		this.ipfs = ipfs;
		this.ipfsStreamUploader = new IpfsStreamUploader(this.ipfs);
		this.ipfsready = false;
		this.headers = '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:8\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:EVENT\n';
		this.blocks = [];
		this.rooms = {};
		this.path = path;
		this.keepPath = this.path+'/'+nameOfStreem+'/';
		this.nameOfStreem = nameOfStreem;
		this.keep = this.keepPath + 'master.m3u8';		
		this.m3u8IPFS = this.keepPath + 'streamIPFS.m3u8';
		this.isPlalistInitialized = false;		
		
		if (!fs.existsSync(this.path)){
		    fs.mkdirSync(this.path);

		    if (!fs.existsSync(this.keepPath))
		    	fs.mkdirSync(this.keepPath);		    

		}else if(!fs.existsSync(this.keepPath))
			fs.mkdirSync(this.keepPath);
		    
		
		this.createRooms();	
	}

	getInstance = () => { 
		return this;
	}

	loadCamerasAsync() {
		return new Promise((resolve, rejected) => {
			cameraHelper.getCameraNamesAsync(appConfig.FFMPEG).then((
				(data) => {
					console.log("CAMERAS LOADED IN STREAM.JS!");
					this.cameras = data;
					resolve(data);
				}));
		});		
	}

	loadAudioAsync() {
		return new Promise((resolve, rejected) => {
			audioHelper.getAudioNamesAsync(appConfig.FFMPEG).then((data) => {
				console.log("AUDIO LOADED IN STREAM.JS!");
				this.audios = data;
				resolve(data);
			});
		});
	}

	getCameraList(){
		return this.cameras;
	}
	getAudioList() {
		return this.audios;
	}

	setCameraByName(camName){
		console.log("Camera changed to: " + camName);
		this.camera = camName;
	}
	setAudioByName(audioName) {
		console.log("Audio changed to: " + audioName);
		this.audio = audioName;
	}

	ffmpeg(debug){		

		const streamObj = this.getInstance();

		console.log('send stream to '+ this.keep);
		console.log('Use camera ' + this.camera)
		//const cameraDetectCommand = `video=\"${this.camera}\"`;
		const cameraDetectCommand = 'video=' + '"' + this.camera + '"' + ':' + 'audio='+'"'+this.audio+'"';
		console.log('Try execute camera with command: ' + cameraDetectCommand);
		const spawnOpts = {
			windowsVerbatimArguments: true,
			
		};
		this.ffmpegProc = spawn(appConfig.FFMPEG, 
		[
			'-f' , 'dshow',
			'-i',cameraDetectCommand, 
			'-profile:v', 'high422', //set profile to support 4:2:2 resolution
			'-level', '3.0',
			'-c:v', 'libx264',
			'-crf','35', //crf is video qualiti from 1(best) to 51 (worst)
			'-preset','veryfast',
			'-c:a', 'aac', 
			'-b:a', '128k', 
			'-ac','2',
			'-f', 'hls', 
			'-pix_fmt', 'yuv420p', //to support 4:2:2 resoultion
			'-hls_time', '4', 
			'-hls_playlist_type', 'event', 
			`${ this.keep }`
		], spawnOpts);

		const ffmpegProcess = this.ffmpegProc;
		ffmpegProcess.removeAllListeners();
		ffmpegProcess.setMaxListeners(0);
		ffmpegProcess.on('error', (err) => {
			console.error("FFmpeg process ERROR! \n");
			ffmpegProcess.kill();
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
			  if (err) { throw err }

			  	let data = {
			  		live : streamObj.ipfsID+"/"+streamObj.nameOfStreem
			  	};
			  	streamObj.rooms.borgStream.broadcast(JSON.stringify(data));
			  	streamObj.rooms[streamObj.nameOfStreem].broadcast(JSON.stringify(result));
			})	
	    }); 		
	}


	start(onPlaylistReadyCallback, streamerInfo) {
		if(!this.camera) {
			throw 'Camera is not set';
		}
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
		streamObj.watcherPID = watch(this.keepPath, function(evt, name) {
			const fileName = fsPath.basename(name);
			const playlistName = fsPath.basename(streamObj.keep);
			let isPlaylist = fileName === playlistName;

			if(isPlaylist && isStreamInitialized === false) {
				console.log("Playlist updated!")
				onPlaylistChangedCallback();
				isStreamInitialized = true;
			}	

			if(evt == 'update' && fileName == playlistName) {
				fs.readFile(streamObj.keep, 'utf8', (err, contents) => {
					let playListContents = contents.split('#');

				    for (var i = 0; i < playListContents.length; i++) {
				    	let element = playListContents[i];

						//cheks if is the chunk
				    	if( element.includes('EXTINF') ) { 
							const chunkValuesArray = element.split(',');
							const chunkExtInf = chunkValuesArray[0];
							const chunkFileName = chunkValuesArray[1].trim();							

							//if chunk with filename not already exist
							var exists = streamObj.blocks.find(x => x.FILE_NAME === chunkFileName) != null;
							if(exists === false) {
								console.log(`CHunk ${chunkFileName} is not exits, try to upload its...`);
								const chunkData = {
									"EXTINF" : chunkExtInf,
									"FILE_NAME": chunkFileName
								}

								streamObj.blocks.push(chunkData);
								const filePath = streamObj.keepPath+chunkFileName;
								streamObj.ipfs.addFromFs((filePath), (err, result) => {
									if (err) { throw err }
									const chunkHash = result[0].hash;
									console.log(`Chunk ${streamObj.keep + chunkData.FILE_NAME} is uploaded to ipfs! \n hash: ${chunkHash}`);
									//create block in DAG
									streamObj.ipfsStreamUploader.addChunkToIpfsDAGAsync(chunkFileName,chunkExtInf,chunkHash)
										.then((streamBlock) => {
											streamObj.roomBroadcaster.startBroadcastAboutSteramBlock(streamBlock);
										})	
										.catch((err) => {
											console.error("ERROR! In upload stream blocks!" + err)
										});
								});
							}
						}		
							
				    }
				});
			}
		});
		streamObj.watcherPID.setMaxListeners(0);
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