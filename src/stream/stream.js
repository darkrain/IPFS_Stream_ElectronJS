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
const IpfsStreamUploader = require('../helpers/ipfsStreamUploader.js');
const StreamRoomBroadcaster = require('../stream/streamRoomBroadcaster.js');

class Stream {

	constructor(ipfs, nameOfStreem, path = 'videos', binFolderPath) {
		console.log(`Try initialize sream with fields: \n ${ipfs} \n ${nameOfStreem} \n ${binFolderPath}`);
		this.ipfs = ipfs;
		this.ipfsStreamUploader = new IpfsStreamUploader(this.ipfs);
		this.ipfsready = false;
		this.ffmpegBinPath = fsPath.join(binFolderPath, 'ffmpeg.exe');
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
			cameraHelper.getCameraNamesAsync(this.ffmpegBinPath).then((
				(data) => {
					console.log("CAMERAS LOADED IN STREAM.JS! " + typeof(data));
					this.cameras = data;
					resolve(data);
				}));
		});		
	}

	getCameraList(){
		return this.cameras
	}

	setCameraByName(camName){
		console.log("Camera changed to: " + camName);
		this.camera = camName;
	}

	ffmpeg(debug){		

		const streamObj = this.getInstance();

		console.log('send stream to '+ this.keep);
		console.log('Use camera ' + this.camera)
		//const cameraDetectCommand = `video=\"${this.camera}\"`;
		const cameraDetectCommand = 'video=' + '"' + this.camera + '"';
		console.log('Try execute camera with command: ' + cameraDetectCommand);
		const spawnOpts = {
			windowsVerbatimArguments: true,
			
		};
		this.ffmpegProc = spawn(this.ffmpegBinPath, 
		[
			'-f' , 'dshow',
			'-i',cameraDetectCommand, 
			'-profile:v', 'baseline',
			'-level', '3.0',
			'-c:v', 'libx264',
			'-crf','21',
			'-preset','veryfast',
			'-c:a', 'aac', 
			'-b:a', '128k', 
			'-ac','2',
			'-f', 'hls', 
			'-hls_time', '6', 
			'-hls_playlist_type', 'event', 
			`${ this.keep }`
		], spawnOpts);

		const ffmpegProcess = this.ffmpegProc;

		if(debug == true) {
			console.log("FFMPEG Input debug process...");			
			//handle process
			ffmpegProcess
				.stderr.addListener('data', (data) => {
					const dataString = data.toString();
					if( dataString.includes('Input/output error') ){
						console.log('Try again');
						streamObj.ffmpegProc.kill();
						streamObj.ffmpeg();
					}		
					console.log(`FFMPEG data! \n ${dataString}`)
				});
			ffmpegProcess
				.stdin.addListener('error', (err) => {
					console.log('FFMPEG STDIN ERROR! \n ' + err.toString());
				});
		}			
	}


	createRooms(){
		const streamObj = this.getInstance();
		const globalRoomName = 'borgStream';

		let rooms = [globalRoomName, this.nameOfStreem];
		
		for (var i = 0; i < rooms.length; i++) {
			let nameRoom = rooms[i];
			streamObj.rooms[nameRoom] = Room(streamObj.ipfs, nameRoom);
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
		this.getInstance().ffmpeg(true);
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
	}

	stop() {
		this.isPlalistInitialized = false;
		if(this.ffmpegProc)
			this.ffmpegProc.kill()
		if( this.watcherPID )
			this.watcherPID.close()
		this.blocks = [];
	}
}

module.exports = Stream;