const electron = require('electron');
const ipc = electron.ipcRenderer;

$(document).ready(function() {
	$('#backBtn').click(function(){
		ipc.send('backBtnClicked');
	});
});

// ### Client event subscriber handlers ###
ipc.on('video-playlist-path-changed', (event, args) => {
	const httpPath = "http://localhost:4000/master.m3u8";
	var video = document.getElementById('video-player');
	if(Hls.isSupported()) {
		const hls = new Hls();
		hls.loadSource(httpPath);
		hls.attachMedia(video);
		hls.on(Hls.Events.MANIFEST_PARSED, () => {						
			video.play();
			video.volume = 0;
		});
	}
});

// ### END Client event subscriber handlers ###
