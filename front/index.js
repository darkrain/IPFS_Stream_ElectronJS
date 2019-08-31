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
});

// ### Client event subscriber handlers ###
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

//When user selected file for ava
ipc.on('selected-file', (event, args) => {
	const fileName = args;
	const filePathForHTML = `../user/${fileName}` + '?v' + Date.now();
	const imgAvaElement = document.getElementById('streamerAvaImg');
	imgAvaElement.src = filePathForHTML;
});

ipc.on('all-data-ready', (event, args) => {
	const isReady = args;
	//When data is ready activate control buttons
	setActiveAllButtons(true, isReady);
	
});
// ### END Client event subscriber handlers ###
function setActiveAllButtons(isControl, isActive) {
	for(let i = 0; i < docButtons.length; i++) {
		let docBtn = docButtons[i];
		if(docBtn.isControl == isControl) {
			document.getElementById(docBtn.btnID).disabled = !isActive;
		}		
	}
}
