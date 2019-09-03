const electron = require('electron');
const ipc = electron.ipcRenderer;

let docButtons = [];

document.addEventListener('DOMContentLoaded',function(){
	const startStreamBtn = document.getElementById('startStream');
	docButtons.push({btnID: startStreamBtn.id, isControl: true});
	const stopStreamBtn = document.getElementById('stopStream');
	docButtons.push({btnID: stopStreamBtn.id, isControl: true});	
	const avaSelectBtn = document.getElementById('loadImgBtn');
	docButtons.push({btnID: avaSelectBtn.id, isControl: false});

	//disable control buttons by default
	startStreamBtn.disabled = true;
	stopStreamBtn.disabled = true;

	const cameraSelection = document.getElementById('cameraSelection');

	startStreamBtn.addEventListener('click', function () {
		ipc.send('update-stream-state', 'start')
	});

	stopStreamBtn.addEventListener('click', function () {
		ipc.send('update-stream-state', 'stop')
	});
	
	avaSelectBtn.addEventListener('click', () => {
		ipc.send('open-file-dialog');
	});

	cameraSelection.addEventListener('change', () => {
		const value = cameraSelection.options[cameraSelection.selectedIndex].value;
		const text = cameraSelection.options[cameraSelection.selectedIndex].text;
		ipc.send('camera-changed', text);
	});	

	const streamerNameInputText = document.getElementById('streamerNameInputText');
	streamerNameInputText.addEventListener('change', () => {
		ipc.send('streamerNameChanged', streamerNameInputText.value);
	});

	//at start send default value from inputText
	ipc.send('streamerNameChanged', streamerNameInputText.value);
});

// ### Client event subscriber handlers ###
ipc.on('streamState', (event, arg) => {
	let streamState = document.getElementById('streamState');
	streamState.innerHTML = 'Stream ' + arg;

	//to avoid errors disable stop btn when start
	const isStarted = arg === 'started';
	const stopStreamBtn = document.getElementById('stopStream');
	const startStreamBtn = document.getElementById('startStream');
	stopStreamBtn.disabled = !isStarted;
	startStreamBtn.disabled = isStarted;
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

//When user selected file for ava
ipc.on('selected-file', (event, args) => {
	const fileName = args;
	const filePathForHTML = `../../user/${fileName}` + '?v' + Date.now();
	const imgAvaElement = document.getElementById('streamerAvaImg');
	imgAvaElement.src = filePathForHTML;
});

ipc.on('all-data-ready', (event, args) => {
	const isReady = args;
	//When data is ready activate control buttons
	setActiveAllButtons(true, isReady);	
});

ipc.on('update-requirements', (event, args) => {
	const listID = "#requirementList";
	const reqList = args;
	$(listID).empty();
	let allIsReady = true;
	for (let [key, value] of Object.entries(reqList)) {
		$(listID).append(
			$('<li>').append(`${key}: ${value}`));
		if(value.includes('empty'))
			allIsReady = false;
	  }	  
	if(allIsReady) {
		$(listID).append("*** Stream is ready to use!!! ***");
	}
})

ipc.on('video-playlist-path-changed', (event, args) => {
	const relativePath = args + '/master.m3u8';
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

// ### END Client event subscriber handlers ###
function setActiveAllButtons(isControl, isActive) {
	for(let i = 0; i < docButtons.length; i++) {
		let docBtn = docButtons[i];
		if(docBtn.isControl === isControl) {
			document.getElementById(docBtn.btnID).disabled = !isActive;
		}		
	}
}
