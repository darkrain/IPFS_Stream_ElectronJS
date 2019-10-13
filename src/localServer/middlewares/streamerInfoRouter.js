const fs = require('fs');
const appConfig = require('../../../appFilesConfig');
const STATUS = require('../data/apiData').STATUS;
const express = require('express');
const PageGetter = require('../../mediators/Singletons/PageGetter');

const router = express.Router();

const STREAM_INFO_PATH = appConfig.files.USER_STREAM_INFO_JSON_PATH;
const RESULT_RESPONSE = {
    status: STATUS.UNDEFINED,
    code: STATUS.UNDEFINED,
    body: STATUS.UNDEFINED
};

function resetResult() {
    RESULT_RESPONSE.status = STATUS.UNDEFINED;
    RESULT_RESPONSE.body = STATUS.UNDEFINED;
    RESULT_RESPONSE.code = STATUS.UNDEFINED;
}

router.post('/', async (req, res) => {
    const streamInfo = req.body;
    try {
        await checkStreamInfo(streamInfo);
        onDataChanged(streamInfo);
    } catch(err) {
        RESULT_RESPONSE.status = STATUS.FAILED;
        RESULT_RESPONSE.body = err.message;
    }

    res.json(RESULT_RESPONSE);
    resetResult();
});

router.get('/', async (req,res) => {
    try {
        const streamInfo = await new Promise((resolve, rejected) => {
            try {
                const data = fs.readFileSync(STREAM_INFO_PATH, 'utf8');
                const parsed = JSON.parse(data);
                resolve(parsed);
            } catch(err) {
                rejected(err);
            }
        });
        RESULT_RESPONSE.status = STATUS.SUCCESS;
        RESULT_RESPONSE.body = streamInfo;
    } catch(err) {
        RESULT_RESPONSE.status = STATUS.FAILED;
        RESULT_RESPONSE.body = err.message;
    }

    res.json(RESULT_RESPONSE);
    resetResult();
});

router.put('/', async (req,res) => {
    const streamInfo = req.body;
    const keys = Object.keys(streamInfo);
    const values = Object.values(streamInfo);

    try {
        const streamInfoData = await appConfig.getParsedDataByPath(STREAM_INFO_PATH);
        for(let i = 0; i < keys.length; i++) {
            const key = keys[i];
            streamInfoData[key] = values[i];
        }

        fs.writeFileSync(STREAM_INFO_PATH, JSON.stringify(streamInfoData), {encoding: 'utf8'});
        RESULT_RESPONSE.status = STATUS.SUCCESS;
        RESULT_RESPONSE.body = streamInfoData;
        onDataChanged(streamInfo);
    } catch(err) {
        RESULT_RESPONSE.status = STATUS.FAILED;
        RESULT_RESPONSE.body = err.message;
    }

    res.json(RESULT_RESPONSE);
    resetResult();
});

router.delete('/', (req,res) => {
    try {
        fs.unlinkSync(STREAM_INFO_PATH);
        RESULT_RESPONSE.body = 'File deleted';
    } catch(err) {
        RESULT_RESPONSE.body = err.message;
    }
    RESULT_RESPONSE.status = STATUS.SUCCESS;
    res.json(RESULT_RESPONSE);
    resetResult();
});

function checkStreamInfo(streamInfo) {
    return new Promise((resolve, rejected) => {
        try {
            const streamKeys = Object.keys(streamInfo);
            const necessaryKeys = [{key:'streamName', name: "Название трасляции"}, {key:'camera', name: 'Камера'}, {key:'audio', name:"Микрофон"}, {key:'avaBase64', name:"Обложка"} ];
            let undefinedKeys = [];
            for(let i = 0; i < necessaryKeys.length; i++) {
                const field = necessaryKeys[i];
                if(!streamKeys.includes(field.key) || streamInfo[field.key] === '') {
                    undefinedKeys.push(field);
                }
            }

            if(undefinedKeys.length > 0) {
                RESULT_RESPONSE.status = STATUS.FAILED;
                RESULT_RESPONSE.code = 'fields_error';
                RESULT_RESPONSE.body = undefinedKeys;
                resolve();
            } else {
                fs.writeFileSync(STREAM_INFO_PATH, JSON.stringify(streamInfo));
                RESULT_RESPONSE.status = STATUS.SUCCESS;
                RESULT_RESPONSE.body = streamInfo;
                resolve();
            }
        } catch(err) {
            rejected(err);
        }
    });
}

function onDataChanged(streamerInfo) {
    const currentPage = PageGetter.getCurrentPageWithType(PageGetter.PageTypes.STREAMER_INFO_PAGE);
    if(!currentPage) {
        console.error(`Cannot get streamer page!`);
        return;
    }

    currentPage.setAudioByName(streamerInfo.audio);
    currentPage.setCameraByName(streamerInfo.camera);
    currentPage.onStreamerNameChanged(streamerInfo.streamName);
    currentPage.onAvaImageUploaded(streamerInfo.avaBase64);
    currentPage.onStreamerDataUpdated();
}


module.exports = router;