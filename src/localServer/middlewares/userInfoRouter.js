const express = require('express');
const router = express.Router();
const appConfig = require('../../../appFilesConfig');
const fs = require('fs');
const userInfoLoader = require('../../data/userInfoLoader');

//CREATE
router.post('/', async (req, res) => {
    const userInfo = req.body;
    const response = await checkUser(userInfo);
    res.json(response);
});

//READ
router.get('/', async (req, res) => {
    const errObj = {ERROR: 'undefined'};
    try {
        const userData = await userInfoLoader.getUserInfoData(appConfig.files.USERINFO_JSON_PATH);
        if(userData) {
            res.json(userData);
        } else {
            errObj.ERROR = 'FILE_NOT_READY';
            res.json(errObj);
        }
    } catch(err) {
        errObj.ERROR = err.message;
        res.json(errObj);
    }
});

//UPDATE
router.put('/', async (req, res) => {
    const userInfo = req.body;
    const resultObj = {status: 'UNDEFINED'};
    try {
        resultObj.status = await new Promise((resolve, rejected) => {
            fs.writeFile(appConfig.files.USERINFO_JSON_PATH, JSON.stringify(userInfo), (err) => {
                if(err)
                    rejected(err);
                resolve('SUCCESS');
            });
        });

    } catch(err) {
        resultObj.status = err.message;
    }
    res.json(resultObj);
});

//DELETE
router.delete('/', async (req, res) => {

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