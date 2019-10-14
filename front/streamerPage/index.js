const electron = require('electron');
const ipc = electron.ipcRenderer;
const chatItem = $.templates("#chatItem");
$(document).ready(function() {
	$('#backBtn').click(function(){
		ipc.send('backBtnClicked');
	});

	ipc.on('chatMessageGetted', (event, args) => {
		let chatBody = $('#chatBody');
		if( $('.nobodywrite', chatBody).length ){
			$('.nobodywrite', chatBody).remove()
		}

		let messageHtml = chatItem.render(args);
		$('tbody',chatBody).append(messageHtml)
	});

	$('#sendMsgBtn').click(function () {
		const messageInput = document.getElementById('messageInput');

		if( messageInput.value === '')
			return false;
		ipc.send('onMessageSend', messageInput.value);
		messageInput.value = '';
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

ipc.on('watcher-count-update', (event, args) => {
	const watchersCount = args;
	const textCounter = document.getElementById('countOfWatchers');
	textCounter.textContent = watchersCount;
});

// ### END Client event subscriber handlers ###
