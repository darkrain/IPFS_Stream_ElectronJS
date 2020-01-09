const IpfsHttpClient = require('ipfs-http-client');
const fs = require('fs');
const multiaddr = require('multiaddr');

class IpfsApiController {
    constructor(ipfsBinRunner, oldIpfs) {

        this.peerList = new Set();

        this.oldIpfs = oldIpfs;
        this.ipfsBinRunner = ipfsBinRunner;
        this.API_URL = {
            GET: null, //method GET
            ADD: null //method POST
        }
        this.fullUrl = this.ipfsBinRunner.getUrl();

        this.ipfsCleint = IpfsHttpClient('http://localhost:5001'); // (the default in Node.js)
        const peerTime = 3000;
        setTimeout(() => {
            this.addSwarm();
        }, peerTime);

        this.API_URL.GET = `${this.fullUrl}api/v0/get`;
        this.API_URL.ADD = `${this.fullUrl}api/v0/add`;
    }

    getId() {
        return this.ipfsCleint.id();
    }

    addPeer(peerId) {
        if(this.peerList.has(peerId)) {
            return;
        }
        const peerUrl = `/p2p-circuit/p2p/${peerId}`;
        this.ipfsCleint.swarm.connect(peerUrl).then(() => {
            console.log(`IPFS API: \n EXTERNAL CLIENT SWARM Connected : ${peerUrl} !`)
            this.peerList.add(peerId); ;
        }).catch((err) => {
            console.error(`IPFS API: \n Fail  CLIENT to connect : ${peerUrl} \n ${err.toString()}!`);    
        });
        
    }
    
    addSwarm() {
        //swarm
        //TODO: Why errors of connect!?

        let swarmArr =  [
            //"/ip4/88.99.120.155/tcp/6001/ipfs/QmQXnEJVdh7vAkKJWWCEqNCLMyZfnbmLFenrchMBn3XAa4"
        ]
        for(let rawAddr of swarmArr) {
            try {
                const addr = multiaddr(rawAddr);
                this.ipfsCleint.swarm.connect(rawAddr).then(() => {
                    console.log(`IPFS API: \n Connected : ${rawAddr} !`);
                }).catch((err) => {
                    console.error(`IPFS API: \n Fail to connect : ${rawAddr} \n ${err.toString()}!`);    
                });
            } catch(err) {
                console.error(`IPFS API ERROR CONNECTED TO ${rawAddr} ! COZ: \n ${err.toString()}`);
                continue;
            }
        }
    }

    getClient() {
        return this.ipfsCleint;
    }

    addFileAsync(pathToFile) {
        return new Promise((resolve, rejected) => {
            const buffer = fs.readFileSync(pathToFile);
			this.ipfsCleint.add(buffer, (err, result) => {
				if (err) {
					rejected(err);
				}
                const chunkHash = result[0].hash;
                resolve(chunkHash);
            });
        });
    }

    getFileAsync(hash) {
        return new Promise((resolve, reject) => {
            this.ipfsCleint.get(hash, (err, files) => {
                if(err) {
                    reject(err);
                }
                const file = files[0];
                const buffer = file.content;
                resolve(buffer);
            });
        });
    }
}

module.exports = IpfsApiController;

