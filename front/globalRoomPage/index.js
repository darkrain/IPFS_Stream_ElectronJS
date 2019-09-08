const electron = require('electron');
const ipc = electron.ipcRenderer;

ipc.on('listOfStreamersUpdated', (event, args) => {
    const streamersArray = args;
    const listID = '#listOfStreamers';
    //empty at start
    $(listID).empty();
    for(let i = 0 ; i < streamersArray.length; i++) {
        const streamerInfo = streamersArray[i];
        const streamerName = streamerInfo.streamerName;
        const imgRelativePath = streamerInfo.relativePath;
        const htmlData = `<div><p>${streamerName}<p><img src="${imgRelativePath}"></div>`;
        $(listID).append(`<li>${htmlData}</li>`);
    }   
});