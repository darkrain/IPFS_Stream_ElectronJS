const fs = require('fs');
const pathModule = require('path');
const appRootPath = require('app-root-path');
const USERINFO_JSON_PATH = pathModule.join(appRootPath.toString(), 'user', 'userInfoJSON.json');

class UserInfoPage {
    constructor() {

        //test
        this.updateUserInfoJSON();
    }

    updateUserInfoJSON = () => {
        let data = {
            "name" : this.userName,
            "nickname" : this.nickName,
            "avaPath" : this.imgAvaPath
        };
        fs.writeFileSync(USERINFO_JSON_PATH, JSON.stringify(data));
    }
}

module.exports = UserInfoPage;