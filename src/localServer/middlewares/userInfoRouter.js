const express = require('express');
const router = express.Router();
const appConfig = require('../../../appFilesConfig');
const fs = require('fs');
const userInfoLoader = require('../../data/userInfoLoader');

const STATUS = require('../data/apiData').STATUS;

//create object once and only set fields afterwards
const RESULT_RESPONSE = {
    status: STATUS.UNDEFINED,
    body: STATUS.UNDEFINED
};

function resetResult() {
    RESULT_RESPONSE.status = STATUS.UNDEFINED;
    RESULT_RESPONSE.body = STATUS.UNDEFINED;
    RESULT_RESPONSE.code = STATUS.UNDEFINED;
}

//CREATE
router.post('/', async (req, res) => {
    const userInfo = req.body;
    
    try {
        await checkUser(userInfo);
    } catch(err) {
        RESULT_RESPONSE.status = STATUS.FAILED;
        RESULT_RESPONSE.body = err.message;
    }

    res.json(RESULT_RESPONSE);
    resetResult()
});

//READ
router.get('/', async (req, res) => {
    try {
        const userData = await userInfoLoader.getUserInfoData(appConfig.files.USERINFO_JSON_PATH);
        if(userData) {
            RESULT_RESPONSE.status = STATUS.SUCCESS;
            RESULT_RESPONSE.body = userData;
        } else {
            RESULT_RESPONSE.status = STATUS.FAILED;
            RESULT_RESPONSE.body = 'FILE NOT EXISTS';
        }
    } catch(err) {
        RESULT_RESPONSE.status = STATUS.FAILED;
        RESULT_RESPONSE.body = err.message;
    }
    res.json(RESULT_RESPONSE);
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
        RESULT_RESPONSE.status = await new Promise((resolve, rejected) => {
            fs.writeFile(appConfig.files.USERINFO_JSON_PATH, JSON.stringify(oldUser), (err) => {
                if(err)
                    rejected(err);
                resolve(STATUS.SUCCESS);
            });
        });
        RESULT_RESPONSE.body = oldUser;

    } catch(err) {
        RESULT_RESPONSE.status = STATUS.FAILED;
        RESULT_RESPONSE.body = err.message;
    }
    res.json(RESULT_RESPONSE);
});

//DELETE
router.delete('/', async (req, res) => {
    try {
        const existingUser = await userInfoLoader.getUserInfoData(appConfig.files.USERINFO_JSON_PATH);
        if(existingUser) {
            fs.unlinkSync(appConfig.files.USERINFO_JSON_PATH);
            RESULT_RESPONSE.body = 'User file removed';
        } else {
            RESULT_RESPONSE.body = 'User file not exists!';
        }

        RESULT_RESPONSE.status = STATUS.SUCCESS;

    } catch (err) {
        RESULT_RESPONSE.status = STATUS.FAILED;
        RESULT_RESPONSE.body = err.message;
    }

    res.json(RESULT_RESPONSE);
});


//Returns response code;
function checkUser(userObj) {
    return new Promise((resolve, rejected) => {
        try {
            const userKeys = Object.keys(userObj);
            const necessaryKeys = [{key:'name', name: "Имя"}, {key:'nickname', name: 'Ник'} , {key: 'photoBase64', name:'Аватар' }];
            let undefinedKeys = [];
            for(let i = 0; i < necessaryKeys.length; i++) {
                const field = necessaryKeys[i];
                if(!userKeys.includes(field.key) || userObj[field.key] === '') {
                    undefinedKeys.push(field);
                }
            }

            
            if(undefinedKeys.length > 0) {
                RESULT_RESPONSE.status = STATUS.FAILED;
                RESULT_RESPONSE.code = 'check_fields';
                RESULT_RESPONSE.body = undefinedKeys;
                resolve();
            }else{
                fs.writeFileSync(appConfig.files.USERINFO_JSON_PATH, JSON.stringify(userObj));
                RESULT_RESPONSE.status = STATUS.SUCCESS;
                RESULT_RESPONSE.body = userObj
                resolve();
            }
        } catch(err) {
            rejected(err);
        }
    });
}



module.exports = router;