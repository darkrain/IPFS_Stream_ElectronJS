const IPFS = require('ipfs');

function initializeIPFS_Async() {
    return new Promise((resolve, rejected) => {
      try {
        const ipfsInstance = new IPFS({
          repo: 'ipfs/pubsub-demo/borgStream',
          EXPERIMENTAL: {
            pubsub: true
          },
          config: {
            Addresses: {
              Swarm: [
                "/ip4/0.0.0.0/tcp/5001",
                "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star"
              ]
            }
          }
      });
      
      ipfsInstance.setMaxListeners(0); //to avoid listeners limit

      ipfsInstance.on('error', (err) => {
          console.log(err);
          rejected(err);
      });
      
      
      ipfsInstance.once('ready', () => ipfsInstance.id((err, peerInfo) => {
          if (err) { rejected(err) }
        //add external peer
        const peerAddr = '/ip4/46.101.114.73/tcp/4001/ipfs/QmXjuSKjf7eKENw9ZURWnm2J1kUTJHzAFMNJotx5RwL5gf';
        ipfsInstance.bootstrap.add(peerAddr, [], (err, res) => {
          if(err) rejected(err);
          console.log('Connected peers: \n' + JSON.stringify(res.Peers));
          console.log('IPFS node started and has ID ' + peerInfo.id)
          resolve(ipfsInstance, peerInfo.id);
        });         
      }));
      } catch(err) {
        rejected(err);
      }     
    });
    
}

module.exports = {
    initializeIPFS_Async
}