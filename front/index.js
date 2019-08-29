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

ipc.on('camera-list-update', (event, args) => {
	const camData = args;	
	console.log(camData)
	//alert("HUI! \n" + JSON.stringify(camData));	 //test	
	$.each(camData, function(key, value) {   
		console.log(value);
		$('#cameraSelection')
			.append($("<option></option>")
						.attr("value",value.name)
						.text(value.name)); 
	});
});


