const PageBase = require('./pageBase.js');

class UserInfoPage extends PageBase{
    constructor(ipc, win) {
        super();
        this.ipc = ipc;
        this.subscribeToIpcEvents(ipc);
    }

    subscribeToIpcEvents(ipc) {
        ipc.on('openGlobalRoomPage', (event, args) => {
          super.goToGlobalPage();
        });
    }
}

module.exports = UserInfoPage;