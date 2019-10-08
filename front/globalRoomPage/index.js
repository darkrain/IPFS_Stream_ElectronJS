const electron = require('electron');
const ipc = electron.ipcRenderer;
const streamersLoop = $.templates("#streamersLoop");
$( document ).ready(function() {
    console.log( "ready!" );

    $('#CreateStreamButton').click(function(){
        const args = {
            pageName: 'streamerInfoPage',
            pageArgs: 'none'
        };
        ipc.send('goto-page', args);
    });


    $('body').on('click', '[data-watch]', (e) => {
        e.preventDefault();
        let watchId = $(event.target).attr('data-watch');

        for( i in window.listOfStreamers){
            let streamer = window.listOfStreamers[i];

            if( streamer.hashOfStreamer == watchId) {
                const streamWatchPage = 'streamWatchPage';
                ipc.send('goto-page', {pageName: streamWatchPage, pageArgs: streamer});  
                break;              
            };
        }
    });

    ipc.on('listOfStreamersUpdated', (event, args) => {
        window.listOfStreamers = args;
        $('#listOfStreamers').html(streamersLoop.render({streamerInfo:args}))
    });
});

