const electron = require('electron');
const ipc = electron.ipcRenderer;

ipc.on('listOfStreamersUpdated', (event, args) => {
    const streamersArray = args;
    const listID = '#listOfStreamers';
    //empty at start
    $(listID).empty();
    for(let i = 0 ; i < streamersArray.length; i++) {
        const streamerInfo = streamersArray[i];
        const streamerHash = streamerInfo.hashOfStreamer;
        const streamerName = streamerInfo.streamerName;
        const imgRelativePath = streamerInfo.relativePath;
        const buttonID = 'streamer' + i.toString();
        const htmlData = `<div><p>${streamerName}<p><img src="${imgRelativePath}">
        <button id="${buttonID}" type="button">Watch ${streamerName}</button>
        </div>`;
        $(listID).append(`<li>${htmlData}</li>`);     
        const streamerButton = document.getElementById(buttonID);
        streamerButton.addEventListener('click', function() {
            alert("Watch streamer with hash: " + streamerHash);
        });
    }   
});