const express = require('express');
const router = express.Router();
const appConfig = require('../../../appFilesConfig');
const fs = require('fs');

router.post('/create', async (req, res, next) => {
    const userInfo = req.body;
    const response = await checkUser(userInfo);
    res.json(response);
    next();
});

//Returns response code;
function checkUser(userObj) {
    return new Promise((resolve) => {
        const response = {code: 'UNDEFINED'};
        try {
            const userKeys = Object.keys(userObj);
            const necessaryKeys = ['name', 'nickname', 'photoBase64'];
            for(let i = 0; i < necessaryKeys.length; i++) {
                const key = necessaryKeys[i];
                if(!userKeys.includes(key)) {
                    throw new Error(`User object not include a key: ${key}`);
                }
            }

            const savableUserData = {
                name: userObj.name,
                nickname: userObj.nickname,
                photoBase64: userObj.photoBase64
            };
            fs.writeFileSync(appConfig.files.USERINFO_JSON_PATH, JSON.stringify(savableUserData));
            response.code = `SUCCESS`;
            resolve(response);
        } catch(err) {
            response.code = `${err.message}`;
            resolve(response);
        }
    });
}

module.exports = router;