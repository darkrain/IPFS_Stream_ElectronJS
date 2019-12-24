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

            if(msg.includes('WebUI')) {
                this.parseApiServer(msgStr);
            }
        });
    }

    parseApiServer(apiServerLine) {
        ///ip4/127.0.0.1/tcp/5001
        //http://127.0.0.1:5001/webui
        const splitted = apiServerLine.split('\n');
        const webUiStr = splitted.find(line => line.includes('WebUI'));
        const urlBySplitted = webUiStr.split(' ');
        this.url = urlBySplitted[1].replace('webui','');
        console.log(`IPFS BINARY API: \n ${this.url}`);
    }

    getUrl() {
        return this.url;
    }

    getProcess() {
        return this.ipfsProcess;
    }
}

module.exports = IpfsBinRunner;