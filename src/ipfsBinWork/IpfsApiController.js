const IpfsHttpClient = require('ipfs-http-client');
const fs = require('fs');
const multiaddr = require('multiaddr');

class IpfsApiController {
    constructor(ipfsBinRunner) {
        this.ipfsBinRunner = ipfsBinRunner;
        this.API_URL = {
            GET: null, //method GET
            ADD: null //method POST
        }
        this.fullUrl = this.ipfsBinRunner.getUrl();

        this.ipfsCleint = IpfsHttpClient('http://localhost:5001'); // (the default in Node.js)

        //addSwarm();

        this.API_URL.GET = `${this.fullUrl}api/v0/get`;
        this.API_URL.ADD = `${this.fullUrl}api/v0/add`;
    }

    addSwarm() {
        //swarm
        //TODO: Why errors of connect!?
        let swarmArr =  [
            "/ip4/0.0.0.0/tcp/5001",
            "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star"
          ]
        
        for(let rawAddr of swarmArr) {
            const addr = multiaddr(rawAddr);
            this.ipfsCleint.swarm.connect(addr).then(() => {
                console.log(`IPFS API: \n Connected : ${rawAddr} !`);
            }).catch((err) => {
                console.error(`IPFS API: \n Fail to connect : ${rawAddr} \n ${err.toString()}!`);    
            });
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

