const electron = require('electron');
const ipc = electron.ipcRenderer;

document.addEventListener('DOMContentLoaded',function(){
	const startStreamBtn = document.getElementById('startStream');
	const stopStreamBtn = document.getElementById('stopStream');
	const cameraSelection = document.getElementById('cameraSelection');

	startStreamBtn.addEventListener('click', function () {
	  ipc.send('update-stream-state', 'start')
	})

	stopStreamBtn.addEventListener('click', function () {
	  ipc.send('update-stream-state', 'stop')
	})	

});

ipc.on('streamState', function (event, arg) {
	let streamState = document.getElementById('streamState');
	streamState.innerHTML = 'Stream ' + arg
})