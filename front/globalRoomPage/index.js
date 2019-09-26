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

    ipc.on('listOfStreamersUpdated', (event, args) => {
        const streamersArray = args;
        const listID = 'listOfStreamers';
        const list = document.getElementById(listID);
        //empty at start
        $(list).empty();
        for(let i = 0 ; i < streamersArray.length; i++) {
            const streamerInfo = streamersArray[i];
            const streamerHash = streamerInfo.hashOfStreamer;
            const streamerName = streamerInfo.streamerName;
            const streamAvaImgBase64 = streamerInfo.streamerAvaBase64;
            const userAvaImgBase64 = streamerInfo.userAvaBase64;
    
            const streamContaner = document.createElement('div');
            const streamNameP = document.createElement('p');
            streamNameP.textContent = streamerName;
            const streamAvaImg = document.createElement('img');
            streamAvaImg.src = `data:image/png;base64,${streamAvaImgBase64}`;
            const userAvaImg = document.createElement('img');
            userAvaImg.src = `data:image/png;base64,${userAvaImgBase64}`;
            const streamerButton = document.createElement('button');
            streamerButton.type = "button";
            streamerButton.textContent = `Watch ${streamerName}`;
            streamerButton.addEventListener('click', function() {
                const streamWatchPage = 'streamWatchPage';
                ipc.send('goto-page', {pageName: streamWatchPage, pageArgs: streamerInfo});
            });

            //TODO: Why it is UNDEFINED!?
            const streamWatchCount = streamerInfo.watchersCount;
            const streamerWatchCountText = document.createElement('p');
            streamerWatchCountText.textContent = `Watch count: ${streamWatchCount}`;

            streamContaner.append(streamNameP);
            streamContaner.append(streamAvaImg);
            streamContaner.append(userAvaImg);
            streamContaner.append(streamerWatchCountText);
            streamContaner.append(streamerButton);
    
            const liElem = document.createElement('li');
            liElem.append(streamContaner);
            list.append(liElem);
        }   
    });
});

