When you try to install some npm package inside project
it will be crash at start because package 'get-video-info' removed.

To restore this package: 
1. clone https://github.com/intfloatbool/get-video-info.git into node_modules
2. cd there, and run 'npm install'

IF IPFS WONT DOWNLOAD CHUNKS

try to remove all ipfs folders:
/users/NAME/.borgStream/ipfs
/users/NAME/.ipfs

info about raw transactions (Infura) in web3:
https://ethereum.stackexchange.com/questions/67268/help-with-signtransaction


If js implementation warns about private keys just remove this
fromo 110 line:
else if (process.env.LIBP2P_FORCE_PNET) {
      throw new Error('Private network is enforced, but no protector was provided')
    } 
node_modules\libp2p\src\index.js 