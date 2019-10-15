const IPFS = require('ipfs');
const AWAIT_TIME = 3000;
async function initializeIPFS_Async() {
  let dataToReturn = null;
  while (!dataToReturn) {
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
    try {
      dataToReturn = await new Promise((resolve, rejected) => {
        ipfsInstance.on('error',  (err) => {
          resolve(err);
        });
        ipfsInstance.once('ready', () => ipfsInstance.id((err, peerInfo) => {
          if (err) { resolve(err) }
          //add external peer
          const peerAddr = '/ip4/46.101.114.73/tcp/4001/ipfs/QmXjuSKjf7eKENw9ZURWnm2J1kUTJHzAFMNJotx5RwL5gf';
          ipfsInstance.bootstrap.add(peerAddr, [], (err, res) => {
            if(err) rejected(err);
            console.log('Connected peers: \n' + JSON.stringify(res.Peers));
            console.log('IPFS node started and has ID ' + peerInfo.id);
            dataToReturn = {
              ipfsInstance: ipfsInstance,
              id: peerInfo.id
            };
            resolve(dataToReturn);
          });
        }));
      });

      if(dataToReturn.name === 'Error') {
        throw dataToReturn;
      }

    } catch(err) {
      console.error(`Failed to start ipfs, coz: ${err.message} , trying again...`);
      dataToReturn = null;
      await new Promise(resolve => setTimeout(resolve, AWAIT_TIME));
    }
  }

  return dataToReturn;
}

module.exports = {
    initializeIPFS_Async
};