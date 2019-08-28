const spawn = require('child_process').spawn;
 
//let camera = '/dev/video0';
//let fileName = 'master';

const Room = require('ipfs-pubsub-room')
const watch = require('node-watch');
const fs = require('fs');	
const md5 = require('md5');	 
const ls = require('ls');


class Stream {

	constructor(ipfs, nameOfStreem, path = 'videos'){

		this.ipfs = ipfs;
		this.ipfsready = false;

		this.headers = '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:8\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:EVENT\n';
		this.blocks = {};
		this.rooms = {};
		this.processUpload = 'wait';

		this.keepPath = path+'/'+nameOfStreem+'/';
		this.keep = this.keepPath+'master.m3u8';
		
		this.camera = false;
		this.nameOfStreem = nameOfStreem;
		this.m3u8IPFS = this.keepPath + 'streamIPFS.m3u8';		
		this.cameras = loadCameras();

		if (!fs.existsSync(path)){
		    fs.mkdirSync(path);


		    if (!fs.existsSync(this.keepPath))
		    	fs.mkdirSync(this.keepPath);
		    

		}else if(!fs.existsSync(this.keepPath))
			fs.mkdirSync(this.keepPath);
		    
		
		this.createRooms()

	}


	loadCameras(){
		let ffmpegListCameras = spawn('../bin/ffmpeg.exe', 
				[
					'-list_devices', 'true',
					'-f', 'dshow',
					'-i', 'dummy'	
				]);

		console.log('asdfsdfs')

		ffmpegListCameras
			.stderr
			.on('data', (err) => {
				err = new String(err);

				console.log('Cameras: '+err);

			})

		return false;


	}

	getCameraList(){
		return this.cameras
	}


	setCamera(index){
		if( this.cameras[index] ){
			this.camera = this.cameras[index].full;
		}
	}

	ffmpeg( debug = 0){
		

		console.log('send stream to '+this.keep);
		console.log('Use camera ' + this.camera)

		this.ffmpegProc = spawn('../bin/ffmpeg.exe', 
			[
				'-f' , 'dshow',
				'-i', `${ this.camera }`, 
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


		let x = this;


		if( debug )
			this.ffmpegProc
			  .stderr
			  .on('data', (err) => {

			  	err = new String(err);

				console.log('Process:', err)

			  	if( err.includes('Input/output error') ){
			  		console.log('Try again');


			  		x.ffmpegProc.kill();

			  		x.ffmpeg();

			  	}

			    
			  })
	}


	createRooms(){

		let rooms = ['borgStream',this.nameOfStreem];
		let x = this;

		x.ipfs.once('ready', () => this.ipfs.id((err, peerInfo) => {
			for (var i = 0; i < rooms.length; i++) {
				let nameRoom = rooms[i];
				x.rooms[nameRoom] = Room(x.ipfs, nameRoom);
			}


		}))

	}


	uploadM3U8(){

		let output = this.headers;
		let x = this;

		for( const [key, value] of Object.entries(this.blocks) ){
			output += value;

		}

		output += '#EXT-X-ENDLIST\n';


	    fs.writeFile(this.m3u8IPFS, output, function(err) {


			x.ipfs.addFromFs(x.m3u8IPFS, (err, result) => {
			  if (err) { throw err }

			  	let data = {
			  		live : x.ipfsID+"/"+x.nameOfStreem
			  	};

			  	x.rooms.borgStream.broadcast(JSON.stringify(data));
			  	x.rooms[x.nameOfStreem].broadcast(JSON.stringify(result));
			})	


	    }); 		

		this.processUpload = 'wait';
	}


	isReadyM3U8(){

		let x = this;
		
		this.isReadyM3U8Interval =	setInterval(function(){
				
			if( x.processUpload == 'executed'){
				let i = Object.keys(x.blocks).length;
				let r = 0;

				for( const [key, value] of Object.entries(x.blocks) ){

					if( value.includes('EXTINF') ) 
						r++;
				}


				if( r == i ){
					x.uploadM3U8()
				}
			}
			
		},200)
	}

	start(){

		let x = this;


		if(!this.camera){
			throw 'Camera is not set';
		}
		
		
		
		x.isReadyM3U8()
		x.ffmpeg(true);
		x.watcher()

	}


	watcher(){



		let x = this;


		x.watcherPID = watch(this.keepPath, function(evt, name) {

			console.log(x.keep + ' -- '+name)

			if( evt == 'update' && name == x.keep){
				
				x.processUpload = 'executed';
				fs.readFile(x.keep, 'utf8', function(err, contents) {				

					let blocks = contents.split('#');


				    for (var i = 0; i < blocks.length; i++) {
				    	let element = blocks[i];

				    	if( element.includes('EXTINF') )  		
	  						x.blocks[md5(element)] = element.split(',');
				    }

					for( const [key, value] of Object.entries(x.blocks) ){

						x.ipfs.addFromFs(x.keepPath+value[1].trim(), (err, result) => {
						  if (err) { throw err }
						  console.log('add new chunk with hash '+ result[0].hash)

							let data = '#IPFSHASH-'+result[0].hash+","+value[1].trim()+"\n"+"#"+value[0]+","+value[1];

							x.blocks[key] = data; 

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