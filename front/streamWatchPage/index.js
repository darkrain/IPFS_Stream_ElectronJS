const electron = require('electron');
const ipc = electron.ipcRenderer;

$(document).ready(function() {
	ipc.on('streamerDataGetted', (event, args) => {
		const streamData = args;
		$('#streamerNameBlock').text(streamData.streamerName);
	});
	$('#backBtn').click(function(){
		ipc.send('gotoGlobalPage');
	});
	$('#createStreamBtn').click(function() {
		const args = {
            pageName: 'streamerInfoPage',
            pageArgs: 'none'
        };
        ipc.send('goto-page', args);
	});

	ipc.on('countOfWatchers-updated', (event, args) => {
		$('#countOfWatchers').text(`Count of watchers: ${args}`);
	});

	ipc.on('chatMessageGetted', (event, args) => {
		addMessageToChat(args);
	});

	$('#sendMsgBtn').click(function () {
		const messageInput = document.getElementById('messageInput');
		ipc.send('onMessageSend', messageInput.value);
	});
});  


function addMessageToChat(msgData) {
	const isMyMessage = msgData.isMyMessage;
	const from = isMyMessage ? "YOU" : msgData.from;
	const message = msgData.message;
	const chatBodyID = 'chatBody';
	const chatBody = document.getElementById(chatBodyID);
	const messageDiv = document.createElement('div');
	const messageFrom = document.createElement('p');
	const messageText = document.createElement('p');
	messageFrom.textContent = `From: ${from}`;
	messageText.textContent = `Message: ${message}`;
	messageDiv.append(messageFrom);
	messageDiv.append(messageText);
	chatBody.append(messageDiv);
}

ipc.on('stream-loaded', (event, args) => {
    const httpPath = "http://localhost:4000/master.m3u8";
	const video = document.getElementById('video-player');
	if(Hls.isSupported()) {
		const hls = new Hls();
		hls.loadSource(httpPath);
		hls.attachMedia(video);
		hls.on(Hls.Events.MANIFEST_PARSED, () => {
			video.play();
		});
	}
});

