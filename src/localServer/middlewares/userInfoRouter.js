const express = require('express');
const router = express.Router();
const appConfig = require('../../../appFilesConfig');
const fs = require('fs');
const userInfoLoader = require('../../data/userInfoLoader');

const STATUS = require('../data/apiData').STATUS;

//create object once and only set fields afterwards
const resultObj = {
    status: STATUS.UNDEFINED,
    body: STATUS.UNDEFINED
};

//CREATE
router.post('/', async (req, res) => {
    const userInfo = req.body;
    try {
        resultObj.status = await checkUser(userInfo);
        resultObj.body = userInfo;
    } catch(err) {
        resultObj.status = STATUS.FAILED;
        resultObj.body = err.message;
    }
    res.json(resultObj);
});

//READ
router.get('/', async (req, res) => {
    try {
        const userData = await userInfoLoader.getUserInfoData(appConfig.files.USERINFO_JSON_PATH);
        if(userData) {
            resultObj.status = STATUS.SUCCESS;
            resultObj.body = userData;
        } else {
            resultObj.status = STATUS.FAILED;
            resultObj.body = 'FILE NOT EXISTS';
        }
    } catch(err) {
        resultObj.status = STATUS.FAILED;
        resultObj.body = err.message;
    }
    res.json(resultObj);
});

//UPDATE
router.put('/', async (req, res) => {
    const userInfo = req.body;
    const keys = Object.keys(userInfo);
    const values = Object.values(userInfo);
    try {
        const oldUser = await userInfoLoader.getUserInfoData(appConfig.files.USERINFO_JSON_PATH);
        if(oldUser) {
            for(let i = 0; i < keys.length; i++) {
                const key = keys[i];
                oldUser[key] = values[i];
            }
        }
        resultObj.status = await new Promise((resolve, rejected) => {
            fs.writeFile(appConfig.files.USERINFO_JSON_PATH, JSON.stringify(oldUser), (err) => {
                if(err)
                    rejected(err);
                resolve(STATUS.SUCCESS);
            });
        });
        resultObj.body = oldUser;

    } catch(err) {
        resultObj.status = STATUS.FAILED;
        resultObj.body = err.message;
    }
    res.json(resultObj);
});

//DELETE
router.delete('/', async (req, res) => {

});


//Returns response code;
function checkUser(userObj) {
    return new Promise((resolve, rejected) => {
        try {
            const userKeys = Object.keys(userObj);
            const necessaryKeys = ['name', 'nickname', 'photoBase64'];
            let undefinedKeys;
            for(let i = 0; i < necessaryKeys.length; i++) {
                const key = necessaryKeys[i];
                if(!userKeys.includes(key) || userObj[key] === '') {
                    if(!undefinedKeys)
                        undefinedKeys = 'UNDEFINED KEYS: \n';
                    undefinedKeys += `${key} \n`;
                }
            }

            if(undefinedKeys) {
                throw new Error(undefinedKeys);
            }

            fs.writeFileSync(appConfig.files.USERINFO_JSON_PATH, JSON.stringify(userObj));
            resolve(STATUS.SUCCESS);
        } catch(err) {
            rejected(err);
        }
    });
}



module.exports = router;