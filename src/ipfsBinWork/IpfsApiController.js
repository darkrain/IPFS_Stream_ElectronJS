const IpfsHttpClient = require('ipfs-http-client');
const fs = require('fs');
const multiaddr = require('multiaddr');

class IpfsApiController {
    constructor(ipfsBinRunner, oldIpfs) {
        this.oldIpfs = oldIpfs;
        this.ipfsBinRunner = ipfsBinRunner;
        this.API_URL = {
            GET: null, //method GET
            ADD: null //method POST
        }
        this.fullUrl = this.ipfsBinRunner.getUrl();

        this.ipfsCleint = IpfsHttpClient('http://localhost:5001'); // (the default in Node.js)

        const peerTime = 5000;
        setTimeout(() => {
            this.addSwarm();
        }, peerTime);

        this.API_URL.GET = `${this.fullUrl}api/v0/get`;
        this.API_URL.ADD = `${this.fullUrl}api/v0/add`;
    }

    addSwarm() {
        //swarm
        //TODO: Why errors of connect!?

        return;
        let swarmArr =  [
            "/dns4/ws-star.discovery.libp2p.io/tcp/443/ws/p2p-websocket-star/"
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

