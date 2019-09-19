const electron = require('electron');
const ipc = electron.ipcRenderer;

$( document ).ready(function() {
    console.log( "ready!" );

    $('#CreateStreamButton').click(function(){
        const args = {
            pageName: 'streamerInfoPage',
            pageArgs: 'none'
        }
        ipc.send('goto-page', args);
    });
});

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
        const userAvaRelativePath = streamerInfo.relativeUserAvaPath;
        const buttonID = 'streamer' + i.toString();
        const htmlData = `<div><p>${streamerName}<p><img src="${imgRelativePath}" width="200" height="75"> 
        <img src="${userAvaRelativePath}" width="200" height="75">  
        </div> <div><button id="${buttonID}" type="button">Watch ${streamerName}</button></div>`;
        $(listID).append(`<li>${htmlData}</li>`);     
        const streamerButton = document.getElementById(buttonID);
        streamerButton.addEventListener('click', function() {
            const streamWatchPage = 'streamWatchPage';
            ipc.send('goto-page', {pageName: streamWatchPage, pageArgs: streamerInfo});
        });
    }   
});