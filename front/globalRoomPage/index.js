const electron = require('electron');
const ipc = electron.ipcRenderer;
const streamersLoop = $.templates("#streamersLoop");
const savedStreamsLoop = $.templates(`#savedStreamsLoop`);
const requestUrl = 'http://localhost:4000/user';

$( document ).ready(function() {
    console.log( "ready!" );

    $.get( requestUrl )
        .done(function( data ) {
            if(data.status == 'SUCCESS'){
                $('#userProfileNick').text(data.body.nickname);
                $('#userProfileName').text(data.body.name);
                $('#userProfileAvatar').attr('src', data.body.photoBase64)
            }
        })
        .fail(function () {
            alert("ERROR");
        });


    $('#CreateStreamButton').click(function(){
        const args = {
            pageName: 'streamerInfoPage',
            pageArgs: 'none'
        };
        ipc.send('goto-page', args);
    });

    $('body').on('click', '[data-watch]', (e) => {
        const isLive = $(event.target).attr('isLive') === 'true';
        e.preventDefault();
        const dataKey = $(event.target).attr('data-watch');
        goToPageByType(isLive, dataKey);
    });

    ipc.on('listOfStreamersUpdated', (event, args) => {
        const streamsList = args;
        window.listOfStreamers = streamsList;
        $('#listOfStreamers').html(streamersLoop.render({streamerInfo:streamsList}))

        //Callback
        setTimeout(() => {
            //avoiding loop iteration to get streamKey, initialize object.
            const streamsHashTable = {};
            for(let i = 0; i < streamsList.length; i++) {
                const stream = streamsList[i];
                streamsHashTable[stream.hashOfStreamer] = stream;
            }

            window.streamsHashTable = streamsHashTable;

        }, 0);
    });

    ipc.on(`savedStreamsUpdated`, (event, args) =>{
        const recordsList = args;
        window.savedStreams = recordsList;
        $('#listOfSavedStreams').html(savedStreamsLoop.render({streamerInfo:recordsList}))

        //Callback
        setTimeout(() => {
            //avoiding loop iteration to get streamKey, initialize object.
            const recordsHashTable = {};
            for(let i = 0; i < recordsList.length; i++) {
                const record = recordsList[i];
                recordsHashTable[record.recordKey] = record;
            }

            window.recordsHashTable = recordsHashTable;

        }, 0);
    });
});

function goToPageByType(isLive, key) {
    const pageName = isLive ? 'streamWatchPage' : 'watchSavedStreamPage';
    const pageArgs = isLive ? window.streamsHashTable[key] : window.recordsHashTable[key];
    console.log(`Go to page with args: \n ${key} \n ${pageName} \n ${JSON.stringify(pageArgs).substr(0, 150)}`);
    //test
    ipc.send('goto-page', {pageName: pageName, pageArgs: pageArgs});
}

