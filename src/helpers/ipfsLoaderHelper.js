const IPFS = require('ipfs');
const AWAIT_TIME = 5000;
const appConfig = require('../../appFilesConfig');
const pathModule = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
async function initializeIPFS_Async() {
  let dataToReturn = null;
  const pathToIpfsRepo = pathModule.join(appConfig.HOME, 'ipfs');
  console.log(`Path to ipfs repo: ${pathToIpfsRepo}`);
  while (dataToReturn == null) {
    removeRepoIfExists(pathToIpfsRepo);
    await new Promise(resolve => setTimeout(resolve, AWAIT_TIME));
    const ipfsInstance = new IPFS({
      repo: pathToIpfsRepo,
      EXPERIMENTAL: {
        pubsub: true
      },
      config: {
        Addresses: {
          Swarm: [
            "/ip4/0.0.0.0/tcp/6001",
            //"/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
            "/ip4/10.0.0.6/tcp/9090/ws/p2p-websocket-star/"
          ]
        }    
      },
      EXPERIMENTAL: {
        pubsub: true
      }
    });

    ipfsInstance.setMaxListeners(0); //to avoid listeners limit
    try {
      dataToReturn = await new Promise((resolve, rejected) => {
        ipfsInstance.on('error',  (err) => {
          rejected(err);
        });
        ipfsInstance.once('ready', () => ipfsInstance.id((err, peerInfo) => {
          if (err) { rejected(err) }
          resolve({
            ipfsInstance: ipfsInstance,
            id: peerInfo.id
          });
        }));
      });

    } catch(err) {
      removeRepoIfExists(pathToIpfsRepo);
      console.error(`Failed to start ipfs, coz: ${err.message} , trying again...`);
      dataToReturn = null;
      await new Promise(resolve => setTimeout(resolve, AWAIT_TIME));
    }
  }

  return dataToReturn;
}

function removeRepoIfExists(repoPath) {
  if(fsExtra.existsSync(repoPath)) {
    try {
      fsExtra.emptyDirSync(repoPath);
    } catch(err) {
      console.error(`Cannot remove LOCK: \n ${err.toString()}`);
    }
  }
}

function removeLockIpfsIfExists() {
  if(fs.existsSync(appConfig.files.IPFS_LOCK_FILE)) {
    fs.unlinkSync(appConfig.files.IPFS_LOCK_FILE);
  }
}

module.exports = {
    initializeIPFS_Async
};