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

	cameraSelection.addEventListener('change', () => {
		const value = cameraSelection.options[cameraSelection.selectedIndex].value;
		const text = cameraSelection.options[cameraSelection.selectedIndex].text;
		ipc.send('camera-changed', text);
	});

});

ipc.on('streamState', function (event, arg) {
	let streamState = document.getElementById('streamState');
	streamState.innerHTML = 'Stream ' + arg
})

ipc.on('camera-list-update', (event, args) => {
	const camData = args;	

	camData.push({name: 'HUEC-OGUREC'}); //test
	console.log(camData)

	$.each(camData, function(key, value) {   
		console.log(value);
		$('#cameraSelection')
			.append($("<option></option>")
						.attr("value",value.name)
						.text(value.name)); 
	});
});


