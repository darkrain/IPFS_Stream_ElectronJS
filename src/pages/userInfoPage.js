const fs = require('fs');
const pathModule = require('path');
const appRootPath = require('app-root-path');
const imgHelper = require('../helpers/imageLoaderHelper.js');
const dialog = require('electron').dialog;
const USERINFO_JSON_PATH = pathModule.join(appRootPath.toString(), 'user', 'userInfoJSON.json');
const frontPagePath = pathModule.join(appRootPath.toString(), 'front', 'userInfoPage', 'img');

class UserInfoPage {
    constructor(ipc) {
        this.ipc = ipc;
        this.subscribeToIpcEvents(ipc);
    }

    subscribeToIpcEvents(ipc) {
        const userInfoPageObj = this;

        ipc.on('update-info', (event, args) => {
            userInfoPageObj.setNickName(args.nickName);
            userInfoPageObj.setUserName(args.userName);
            userInfoPageObj.updateUserInfoJSON();
        });

        ipc.on('open-user-ava', (event, args) => { 
            dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [
                { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
              ]
            }).then(result => { 
              console.log(result.canceled);
              console.log(result.filePaths);
              const file = result.filePaths[0];
                if(file) {
                  console.log("Try to openFile: " + file.toString());
                  imgHelper.copyImageToApplicationFolerAsync(file, 'defaultUserAva', frontPagePath).then((copiedImgPath) => {
                    const fileName = pathModule.basename(copiedImgPath); //to send in client script without path
                    event.sender.send('selected-userava-file', fileName);

                })};
              })
              .catch(err => {
                console.err(err);
              });
          });
              
        ipc.on('userNameChanged', (event, args) => {
            userInfoPageObj.setUserName(args);
            userInfoPageObj.updateUserInfoJSON();
        });

        ipc.on('userNicknameChanged', (event, args) => {
            userInfoPageObj.setNickName(args);
            userInfoPageObj.updateUserInfoJSON();
        });
    }

    setUserName(userName) {
        this.userName = userName;
    }
    setNickName(nickName) {
        this.nickName = nickName;
    }

    updateUserInfoJSON = () => {
        this.data = {
            "name" : this.userName,
            "nickname" : this.nickName,
        };
        fs.writeFileSync(USERINFO_JSON_PATH, JSON.stringify(this.data));
    }
}

module.exports = UserInfoPage;