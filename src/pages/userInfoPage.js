const fs = require('fs');
const pathModule = require('path');
const dialog = require('electron').dialog;
const PageBase = require('./pageBase.js');
const userInfoLoader = require('../data/userInfoLoader');
const errorHelper = require('../helpers/dialogErrorHelper');
const appConfig = require('../../appFilesConfig');
const filesChecker = require('../data/fileCheking');
const USERINFO_JSON_PATH = appConfig.files.USERINFO_JSON_PATH;
const userPhotoPath = appConfig.folders.USER_PHOTO_PATH;
const fileHandler = require('../data/fileHandling');

class UserInfoPage extends PageBase{
    constructor(ipc, win) {
        super();
        this.ipc = ipc;
        this.subscribeToIpcEvents(ipc);

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

        ipc.on('open-user-ava', async (event, args) => { 
            const maxUserAvaSize = appConfig.fileSizes.MAX_USER_AVA_KB_SIZE;
            while(true) {
              try{
                const result = await dialog.showOpenDialog({
                  properties: ['openFile'],
                  filters: [
                    { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
                  ]
                });
                const file = result.filePaths[0];
                if(file) {
                  if(!filesChecker.isFileWithCorrectSizeSync(file, maxUserAvaSize)) {
                    //go again if file not supported by size
                    //say that file too largs
                    await dialog.showMessageBox({type:'warning', title:'File size warning', message: `File size more than ${maxUserAvaSize} KB!!`})
                    continue;
                  }
                  console.log("Try to openFile: " + file.toString());
                  const imgBase64 = await fileHandler.readFileAsBase64Async(file);
                  userInfoPageObj.lastPhotoBase64 = imgBase64;
                  event.sender.send('selected-userava-file', imgBase64);
                  break;

                } else {
                  break;
                } 
              }catch(err) {
                console.error(`Cannot open user ava file coz: \n${err.message} \n${err.stack}`);
                throw err;
              }
            }
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
            "photoBase64" : this.lastPhotoBase64
        };
        fs.writeFileSync(USERINFO_JSON_PATH, JSON.stringify(this.data));
    }
}

module.exports = UserInfoPage;