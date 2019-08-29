const spawn = require('child_process').spawn;
 
//let camera = '/dev/video0';
//let fileName = 'master';

const Room = require('ipfs-pubsub-room')
const watch = require('node-watch');
const fs = require('fs');	
const md5 = require('md5');	 
const ls = require('ls');
const fsPath = require('path');
const cameraHelper = require('./ffmpegCameraHelper');

class Stream {

	constructor(ipfs, nameOfStreem, path = 'videos') {
		this.ipfs = ipfs;
		this.ipfsready = false;
		this.ffmpegBinPath = fsPath.join(__dirname.replace('src','bin'), 'ffmpeg.exe');
		this.headers = '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:8\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:EVENT\n';
		this.blocks = {};
		this.rooms = {};
		this.processUpload = 'wait';

		this.keepPath = path+'/'+nameOfStreem+'/';
		this.keep = this.keepPath+'master.m3u8';
		
		this.camera = false;
		this.nameOfStreem = nameOfStreem;
		this.m3u8IPFS = this.keepPath + 'streamIPFS.m3u8';		
		
		if (!fs.existsSync(path)){
		    fs.mkdirSync(path);


		    if (!fs.existsSync(this.keepPath))
		    	fs.mkdirSync(this.keepPath);
		    

		}else if(!fs.existsSync(this.keepPath))
			fs.mkdirSync(this.keepPath);
		    
		
		this.createRooms();
	}

	getInstance() { 
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

	setCamera(index){
		if( this.cameras[index] ){
			this.camera = this.cameras[index].full;
		}
	}

	ffmpeg( debug = 0 ){		
		console.log('send stream to '+ this.keep);
		console.log('Use camera ' + this.camera)

		this.ffmpegProc = spawn(this.ffmpegBinPath, 
		[
			'-f' , 'dshow',
			'-i', `\"${ this.camera }\"`, 
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
		]);

		if( debug )
			this.ffmpegProc
			  .stderr
			  .on('data', (err) => {

			  	err = new String(err);

				console.log('Process:', err)

			  	if( err.includes('Input/output error') ){
			  		console.log('Try again');
			  		this.getInstance().ffmpegProc.kill();
			  		this.getInstance().ffmpeg();
			  	}		    
			  })
	}


	createRooms(){

		let rooms = ['borgStream',this.nameOfStreem];

		this.getInstance().ipfs.once('ready', () => this.ipfs.id((err, peerInfo) => {
			for (var i = 0; i < rooms.length; i++) {
				let nameRoom = rooms[i];
				this.getInstance().rooms[nameRoom] = Room(this.getInstance().ipfs, nameRoom);
			}
		}))

	}


	uploadM3U8() {
		let output = this.headers;
		for( const [key, value] of Object.entries(this.blocks) ){
			output += value;

		}
		output += '#EXT-X-ENDLIST\n';

	    fs.writeFile(this.m3u8IPFS, output, function(err) {

			this.getInstance().ipfs.addFromFs(this.getInstance().m3u8IPFS, (err, result) => {
			  if (err) { throw err }

			  	let data = {
			  		live : this.getInstance().ipfsID+"/"+this.getInstance().nameOfStreem
			  	};

			  	this.getInstance().rooms.borgStream.broadcast(JSON.stringify(data));
			  	this.getInstance().rooms[this.getInstance().nameOfStreem].broadcast(JSON.stringify(result));
			})	
	    }); 		

		this.processUpload = 'wait';
	}


	isReadyM3U8(){
		this.isReadyM3U8Interval =	setInterval(function(){
				
			if( this.getInstance().processUpload == 'executed'){
				let i = Object.keys(this.getInstance().blocks).length;
				let r = 0;

				for( const [key, value] of Object.entries(this.getInstance().blocks) ){

					if( value.includes('EXTINF') ) 
						r++;
				}


				if( r == i ){
					this.getInstance().uploadM3U8()
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
		this.getInstance().watcherPID = watch(this.keepPath, function(evt, name) {
			console.log(this.getInstance().keep + ' -- '+name)
			if( evt == 'update' && name == this.getInstance().keep) {				
				this.getInstance().processUpload = 'executed';
				fs.readFile(this.getInstance().keep, 'utf8', function(err, contents) {				
					let blocks = contents.split('#');


				    for (var i = 0; i < blocks.length; i++) {
				    	let element = blocks[i];

				    	if( element.includes('EXTINF') )  		
							this.getInstance().blocks[md5(element)] = element.split(',');
				    }

					for( const [key, value] of Object.entries(this.getInstance().blocks) ){
						this.getInstance().ipfs.addFromFs(this.getInstance().keepPath+value[1].trim(), (err, result) => {
						  if (err) { throw err }
						  console.log('add new chunk with hash '+ result[0].hash)

							let data = '#IPFSHASH-'+result[0].hash+","+value[1].trim()+"\n"+"#"+value[0]+","+value[1];

							this.getInstance().blocks[key] = data; 

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