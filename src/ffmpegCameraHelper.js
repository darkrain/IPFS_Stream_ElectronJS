const dshow = require('directcam');

function getNamesOfCameras() {
    let cameras = [];
    dshow.cameras(null, function (err, data) {
        if(err) {
            console.log("CAnnot load cameras!");
            return cameras;
        }
        for(let i = 0; i < data.length; i++) {
            const camName = data[i].Name;
            cameras.push(camName);
        }
        return cameras;
    });
}


module.exports = {
    getNamesOfCameras
}