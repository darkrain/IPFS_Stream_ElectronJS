const nodeWebCam = require('node-webcam');
const dshow = require('directcam');

//TEST
getNameOfCameras();

function getNameOfCameras() {
    let cameras = [];
    dshow.cameras(null, function (err, data) {
        const camsJson = JSON.stringify(data);
        console.log(`CAMERAS: \n ${camsJson}`);
    });
}

function parseDataForCameras(dataToParse) {

}

module.exports = {
    parseDataForCameras,
    getNameOfCameras
}