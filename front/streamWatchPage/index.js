const electron = require('electron');
const ipc = electron.ipcRenderer;

$(document).ready(function() {

});

ipc.on('streamerDataGetted', (event, args) => {
    const streamData = args;
    alert("STREAM DATA!\n" + JSON.stringify(streamData));
});

