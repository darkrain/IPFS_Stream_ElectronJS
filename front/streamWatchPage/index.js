const electron = require('electron');
const ipc = electron.ipcRenderer;

$(document).ready(function() {

});  
ipc.on('streamerDataGetted', (event, args) => {
    const streamData = args;
    //alert("STREAM DATA!\n" + JSON.stringify(streamData));
    $('#streamerNameBlock').text(streamData.nameOfStream);
});

ipc.on('stream-loaded', (event, args) => {
    const httpPath = "http://localhost:4000/master.m3u8";
	var video = document.getElementById('video-player');
	if(Hls.isSupported()) {
		var hls = new Hls();
		hls.loadSource(httpPath);
		hls.attachMedia(video);
		hls.on(Hls.Events.MANIFEST_PARSED, () => {
			video.play();
		});
	}
});

