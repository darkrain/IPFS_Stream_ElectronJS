const IPFS = require('ipfs');

function initializeIPFS_Async() {
    return new Promise((resolve, rejected) => {
        const ipfsInstance = new IPFS({
            repo: 'ipfs/pubsub-demo/borgStream',
            EXPERIMENTAL: {
              pubsub: true
            },
            config: {
              Addresses: {
                Swarm: [
                  "/ip4/0.0.0.0/tcp/5001",
                ]
              }
            },
        });
        
                  
        ipfsInstance.on('error', (err) => {
            console.log(err);
            rejected(err);
        });
        
        
        ipfsInstance.once('ready', () => ipfsInstance.id((err, peerInfo) => {
            if (err) { throw err }
        
          console.log('IPFS node started and has ID ' + peerInfo.id)
          resolve(ipfsInstance, peerInfo.id);
        }));
    })
    
}

module.exports = {
    initializeIPFS_Async
}