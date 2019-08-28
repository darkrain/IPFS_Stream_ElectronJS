const spawn = require('child_process').spawn;
 
let camera = '/dev/video0';
let fileName = 'master';


const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')
const watch = require('node-watch');
const fs = require('fs');	
const md5 = require('md5');	 



const stream = {
	headers: '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:8\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:EVENT\n',
	blocks: {},
	rooms: {},
	processUpload: 'wait',

	set: function(filename, path, camera, nameOfStreem){
		this.IPFSm3u8 = 'IPFSm3u8.m3u8';

		this.keep = path+filename;
		this.keepPath = path;
		this.camera = camera;
		this.nameOfStreem = nameOfStreem;
		this.m3u8IPFS = 'streamIPFS.m3u8';



	},
	ipfsInit : function(repoName, rooms){
	    var ipfs = new IPFS({
	        repo: 'ipfs/pubsub-demo/'+repoName,
	        EXPERIMENTAL: {
	          pubsub: true
	        },
	        config: {
	          Addresses: {
	            Swarm: [
	              "/ip4/0.0.0.0/tcp/4001",
	            ]
	          }
	        },
	    })

	    ipfs.on('ready', () => {

	      
	      ipfs.id((err, id) => {
	        
	          if (err) {
	            return console.log(err)
	          }
	      


	          console.log(id)
	      })
	  
	    })


	    ipfs.on('error', (err) => {
	      return console.log(err)
	    })


	    ipfs.once('ready', () => this.ipfs.id((err, peerInfo) => {
	      if (err) { throw err }


	      console.log('IPFS node started and has ID ' + peerInfo.id)

	  		stream.ipfsID = peerInfo.id;

	  		for (var i = 0; i < rooms.length; i++) {
	  			let nameRoom = rooms[i];
	  			stream.rooms[nameRoom] = Room(stream.ipfs, nameRoom);
	  		}



	    }))


	    this.ipfs = ipfs;

	},
	uploadM3U8: function(){

		let output = this.headers;

		for( const [key, value] of Object.entries(this.blocks) ){
			output += value;

		}

		output += '#EXT-X-ENDLIST\n';


	    fs.writeFile(this.m3u8IPFS, output, function(err) {


			stream.ipfs.addFromFs(stream.m3u8IPFS, (err, result) => {
			  if (err) { throw err }

			  	let data = {
			  		live : stream.ipfsID+"/"+stream.nameOfStreem
			  	};

			  	stream.rooms.borgStream.broadcast(JSON.stringify(data));
			  	stream.rooms[stream.nameOfStreem].broadcast(JSON.stringify(result));
			})	


	    }); 		

		this.processUpload = 'wait';
	},
	isReadyM3U8: function(){

		
			setInterval(function(){
				
				if( stream.processUpload == 'executed'){
					let i = Object.keys(stream.blocks).length;
					let r = 0;

					for( const [key, value] of Object.entries(stream.blocks) ){

						if( value.includes('EXTINF') ) 
							r++;
					}


					if( r == i ){
						stream.uploadM3U8()
					}
				}
				
			},200)
	},
	process: function(){
		
		this.ipfsInit('stream',['borgStream',this.nameOfStreem]);
		this.isReadyM3U8()
		this.ffmpeg(true);


		this.ipfs.on('ready', () => {
			watch(this.keepPath, function(evt, name) {

				if( evt == 'update' && name == stream.keep){
					
					stream.processUpload = 'executed';
					fs.readFile(stream.keep, 'utf8', function(err, contents) {				
						let blocks = contents.split('#');

					    for (var i = 0; i < blocks.length; i++) {
					    	element = blocks[i];

					    	if( element.includes('EXTINF') )  		
		  						stream.blocks[md5(element)] = element.split(',');
					    }

						for( const [key, value] of Object.entries(stream.blocks) ){

							stream.ipfs.addFromFs(stream.keepPath+value[1].trim(), (err, result) => {
							  if (err) { throw err }
							  //console.log(result)

								let data = '#IPFSHASH-'+result[0].hash+","+value[1].trim()+"\n"+"#"+value[0]+","+value[1];

								stream.blocks[key] = data; 

							})		  						

						}




					})
				}
			});
		});

		
	},
	ffmpeg : function( debug = 0){
		
		this.ffmpegProc = spawn('ffmpeg', 
			[
				'-i', `${ this.camera }`, 
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
			    console.log('Process:', new String(err))
			  })
	}	
}



//ffmpeg(camera, fileName, true)



//const testRepo = IPFS.createRepo('test');


//testRepo.repo.ipfs.on('ready', () => {
	stream.set('master.m3u8', 'videos/', '/dev/video0', 'mystreamipfs')
	stream.process()	
//})
































/*
async function async(){

const ipns = require('ipns');
const crypto = require('libp2p-crypto');
var keyipns;


    		
    if (fs.existsSync('keys.json')){
      let rawdata = fs.readFileSync('keys.json');  
      let state = JSON.parse(rawdata);
      keyipns = state;
    }else{


		const keys = await crypto.keys.generateKeyPair('RSA', 2048, (err, keypair) => {
		    fs.writeFile('keys.json', JSON.stringify(keypair), function(err) {
		        if(err) {
		            return console.log(err);
		        }
		    }); 
		    keyipns = keypair;

		});

    }


    console.log(keyipns)

	await ipns.create(keyipns, '/ipfs/QmNjRHSsT4Tj2nrvjaaGC1DmkQaV7Ec6gxZ34Qsrvqc2Zf', 0,'100', (err, entryData) => {
		console.log(err)
		console.log(entryData);
	})




	



	
};

async()*/




/*fs.readFile(`videos/master.m3u8`, 'utf8', function(err, contents) {

    blocks = contents.split('#');



    
    blocks.forEach(function(element) {
  		console.log(element);
	});
});	

*/
















/*

const queue = [];
var count = 0;



function chainQueuePush(err, cid){
	//queue.push(cid.toBaseEncodedString());
	console.log(cid.toBaseEncodedString());
	const dagParams = { format: 'dag-cbor', hashAlg: 'sha3-512' };

	if( count <=  4){
		testRepo.repo.ipfs.dag.put({
			test:'test'+count, 
			link : { '/' : cid.toBaseEncodedString() }
		}, dagParams, chainQueuePush);
		count++;
	}else{
		getD(cid.toBaseEncodedString())
	}
}


testRepo.repo.ipfs.on('ready', () => {

	const dagParams = { format: 'dag-cbor', hashAlg: 'sha3-512' };

	//getD('bafyriqhjyoyzp6wqywqegmmg6gzsr5r4s7uztqy7snjsa4v4bnlxckzphk3qfla2qojl72soqovelkzmgk2k55ydlurcgch4ltisw6nhshoxk')


	testRepo.repo.ipfs.dag.put({test:'test'}, dagParams, chainQueuePush);


})


async function getD(cid){

	const obj = await testRepo.repo.ipfs.dag.tree(cid);
	console.log(obj.value)
}
*/