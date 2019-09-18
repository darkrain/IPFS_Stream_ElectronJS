const fs = require('fs');
const pathModule = require('path');
const appRootPath = require('app-root-path');
const imgHelper = require('../helpers/imageLoaderHelper.js');
const dialog = require('electron').dialog;
const PageBase = require('./pageBase.js');
const userInfoLoader = require('../data/userInfoLoader');
const errorHelper = require('../helpers/dialogErrorHelper');
const USERINFO_JSON_PATH = pathModule.join(appRootPath.toString(), 'user', 'userInfoJSON.json');
const userPhotoPath = pathModule.join(appRootPath.toString(), 'front', 'userInfoPage', 'img', 'photo');
const defaultPhotoRelativePath = './img/defaultUserAva.png';

class UserInfoPage extends PageBase{
    constructor(ipc, win) {
        super();
        this.ipc = ipc;
        this.subscribeToIpcEvents(ipc);

        this.lastPhotoRelativePath = defaultPhotoRelativePath;

        //preload user info if exists
        userInfoLoader.getUserInfoData(USERINFO_JSON_PATH).then((data) => {
            if(data != null) {
              win.webContents.send('nameChanged', data.name);
              win.webContents.send('nickNameChanged', data.nickname);  
            }
            
            //preload photo if exists
            if(fs.existsSync(userPhotoPath)) {
              if(fs.readdir(userPhotoPath, (err, files) => {
                if(err)
                  throw err;
                if(files.length > 0) {
                  win.webContents.send('selected-userava-file', files[0]);
                }
              }));
            }           
        })
        .catch((err) => {
          errorHelper.showErorDialog('UserInfo page', err.toString(), true);
        });
    }

    subscribeToIpcEvents(ipc) {
        const userInfoPageObj = this;

        ipc.on('update-info', (event, args) => {
            userInfoPageObj.setNickName(args.nickName);
            userInfoPageObj.setUserName(args.userName);
            userInfoPageObj.updateUserInfoJSON();
        });

        ipc.on('openGlobalRoomPage', (event, args) => {
          super.goToGlobalPage();
        })

        ipc.on('open-user-ava', (event, args) => { 
            dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [
                { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
              ]
            }).then(result => { 
              const file = result.filePaths[0];
                if(file) {
                  console.log("Try to openFile: " + file.toString());
                  imgHelper.copyImageToApplicationFolerAsync(file, 'defaultUserAva', userPhotoPath).then((copiedImgPath) => {
                    const fileName = pathModule.basename(copiedImgPath); //to send in client script without path
                    userInfoPageObj.lastPhotoRelativePath = './img/photo/' + fileName;
                    event.sender.send('selected-userava-file', fileName);

                })};
              })
              .catch(err => {
                console.error(err);
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
            "photoPath" : this.lastPhotoRelativePath
        };
        fs.writeFileSync(USERINFO_JSON_PATH, JSON.stringify(this.data));
    }
}

module.exports = UserInfoPage;