const appConfig = require('../../appFilesConfig');
const {spawn, exec} = require('child_process');

class IpfsBinRunner {
    constructor() {
        const opt = [
            'daemon'
        ];
        this.ipfsProcess = spawn(appConfig.files.IPFS_BIN, opt);

        this.ipfsProcess.stdout.on(`data`, (msg) => {
            console.log(`IPFS BIN: ${msg.toString()}`);
        });
    }

    getProcess() {
        return this.ipfsProcess;
    }
}

module.exports = IpfsBinRunner;