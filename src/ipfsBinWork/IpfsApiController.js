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

        this.API_URL.GET = `${this.fullUrl}api/v0/get`;
        this.API_URL.ADD = `${this.fullUrl}api/v0/add`;

        this.ipfsCleint.config
    }

    getId() {
        return this.ipfsCleint.id();
    }

    async addPeerAsync(peerId) {
        if(this.peerList.has(peerId)) {
            return;
        }
        const peerUrl = `/p2p-circuit/p2p/${peerId}`;
        const delay = 2000;
        let isConnected = false;
        this.peerList.add(peerId); 
        while(isConnected === false)
        {
            try {
                await this.ipfsCleint.swarm.connect(peerUrl);
                console.log(`IPFS API: \n EXTERNAL CLIENT SWARM Connected : ${peerUrl} !`);          
                isConnected = true;
            } catch(err) {
                console.error(`IPFS API: \n Fail  CLIENT to connect : ${peerUrl} \n ${err.toString()}!`);    
                await new Promise((resolve) => setTimeout(resolve, delay));
                isConnected = false;
                continue;
            }
        }
        
    }
    
    async addSwarmAsync() {
        //swarm
        //TODO: Why errors of connect!?

        let swarmArr =  [
            "/ip4/157.245.81.248/tcp/4001/ipfs/QmYvxfwEGPGgT9jDD7ZMFMLsdKjNnZ8YnN6DqzMsJcGY2T"
        ]
        for(let rawAddr of swarmArr) {
            try {
                const addr = multiaddr(rawAddr);
                await this.ipfsCleint.swarm.connect(rawAddr);
                console.log(`IPFS API: \n Connected : ${rawAddr} !`);
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

