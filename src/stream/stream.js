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

class Stream {

	constructor(ipfs, nameOfStreem, path = 'videos', binFolderPath) {
		
		console.log(`Try initialize sream with fields: \n ${ipfs} \n ${nameOfStreem} \n ${binFolderPath}`);

		this.ipfs = ipfs;
		this.ipfsready = false;
		this.ffmpegBinPath = fsPath.join(binFolderPath, 'ffmpeg.exe');
		this.headers = '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:8\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:EVENT\n';
		this.blocks = {};
		this.rooms = {};
		this.processUpload = 'wait';

		this.path = path;
		this.keepPath = this.path+'/'+nameOfStreem+'/';
		this.nameOfStreem = nameOfStreem;
		this.keep = this.keepPath + 'master.m3u8';
		
		this.camera = false;		
		this.m3u8IPFS = this.keepPath + 'streamIPFS.m3u8';		
		
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
			windowsVerbatimArguments: true
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
		let rooms = ['borgStream',this.nameOfStreem];

		streamObj.ipfs.once('ready', () => this.ipfs.id((err, peerInfo) => {
			for (var i = 0; i < rooms.length; i++) {
				let nameRoom = rooms[i];
				streamObj.rooms[nameRoom] = Room(streamObj.ipfs, nameRoom);
			}
		}))

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

		this.processUpload = 'wait';
	}


	isReadyM3U8() {
		const thisStream = this.getInstance();
		this.isReadyM3U8Interval =	setInterval(function() {
				
			if(thisStream.processUpload == 'executed'){
				let i = Object.keys(thisStream.blocks).length;
				let r = 0;

				for( const [key, value] of Object.entries(thisStream.blocks) ){

					if( value.includes('EXTINF') ) 
						r++;
				}


				if( r == i ){
					thisStream.uploadM3U8()
				}
			}			
		},200)
	}

	start() {

		if(!this.camera) {
			throw 'Camera is not set';
		}		
		this.getInstance().isReadyM3U8()
		this.getInstance().ffmpeg(true);
		this.getInstance().watcher()
	}



	watcher(){
		const streamObj = this.getInstance();
		streamObj.watcherPID = watch(this.keepPath, function(evt, name) {
			console.log(streamObj.keep + ' -- '+name)
			if( evt == 'update' && name == streamObj.keep) {				
				streamObj.processUpload = 'executed';
				fs.readFile(this.streamObj.keep, 'utf8', function(err, contents) {				
					let blocks = contents.split('#');

				    for (var i = 0; i < blocks.length; i++) {
				    	let element = blocks[i];

				    	if( element.includes('EXTINF') )  		
						streamObj.blocks[md5(element)] = element.split(',');
				    }

					for( const [key, value] of Object.entries(streamObj.blocks) ){
						streamObj.ipfs.addFromFs(streamObj.keepPath+value[1].trim(), (err, result) => {
						  if (err) { throw err }
						  console.log('add new chunk with hash '+ result[0].hash)
							let data = '#IPFSHASH-'+result[0].hash+","+value[1].trim()+"\n"+"#"+value[0]+","+value[1];
							streamObj.blocks[key] = data; 
						})		  						

					}
				})
			}
		});

	}

	stop(){
		clearInterval(this.isReadyM3U8Interval);
		this.ffmpegProc.kill()

		if( this.watcherPID )
			this.watcherPID.close()
		this.blocks = {};
		this.processUpload = 'wait';

		//this.watcherPID = false;


	}

}

module.exports = Stream;