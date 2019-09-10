const electron = require('electron');
const ipc = electron.ipcRenderer;


document.addEventListener('DOMContentLoaded', () => {

    
});

ipc.on('streamerDataGetted', (event, args) => {
    const streamData = args;
    //alert("STREAM DATA!\n" + JSON.stringify(args));
});

