const appConfig = require('../../appFilesConfig');
const {spawn, exec} = require('child_process');

class IpfsBinRunner {
    constructor() {
        const opt = [
            'daemon'
        ];
        this.ipfsProcess = spawn(appConfig.files.IPFS_BIN, opt);
        this.ipfsProcess.stdout.on(`data`, (msg) => {
            const msgStr = msg.toString();
            console.log(`IPFS BIN: ${msgStr}`);

            if(msg.includes('API')) {
                this.parseApiServer(msgStr);
            }
        });
    }

    parseApiServer(apiServerLine) {
        const splittedBySpace = apiServerLine.split(' ');
        const addr = splittedBySpace[4];
        ///ip4/127.0.0.1/tcp/5001
        //http://127.0.0.1:5001/
        const splittedAddr = addr.split('/');
        this.url = `http://${splittedAddr[2]}:${splittedAddr[4]}/`;

        console.log(`ADDR OF IPFS API: ${this.url}`);
    }

    getUrl() {
        return this.url;
    }

    getProcess() {
        return this.ipfsProcess;
    }
}

module.exports = IpfsBinRunner;