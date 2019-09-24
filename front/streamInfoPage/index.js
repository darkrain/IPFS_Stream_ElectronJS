const electron = require('electron');
const ipc = electron.ipcRenderer;

let userRequirements = []; // data requirments for stream to show user when he tap on Start button
document.addEventListener('DOMContentLoaded',function(){
	//the property 'isControl' means that button cannot be pushed more than once...
	const startStreamBtn = document.getElementById('openStreamBtn');
	const avaSelectBtn = document.getElementById('loadImgBtn');
	const cameraSelection = document.getElementById('cameraSelection');
	const audioSelection = document.getElementById('audioSelection');

	function getRequirements() {
		let prettyViewReq = [];
		for (let [key, value] of Object.entries(userRequirements)) { 
			if(value.includes('empty')) {
				const translatedKey = getPrettyViewByRequirementKey(key);
				prettyViewReq.push(`${translatedKey} - нет данных.`)
			}
		}
		//Также чекаем камеру
		const camText = cameraSelection.options[cameraSelection.selectedIndex].text;
		//проверяем камеру на ошибку ffmpeg
		if(camText.includes('Could not enumerate')) {
			prettyViewReq.push(`Камера - не удалось определить.`);
		}
		return prettyViewReq;
	}

	function getPrettyViewByRequirementKey(reqKey) {
		switch(reqKey) {
			case "StreamerName": {
				return 'Название стрима'
			}
			case "AvatarHash": {
				return 'Наличие фотографии'
			}
			case "IPFS_NodeID": {
				return 'Подключение к сети'			
			}
			default : {		
				return '?НЕИЗВЕСТНО?';
			}
		}
	}

	startStreamBtn.addEventListener('click', function () {
		//проверяем есть ли невыполненные действия:
		const requirements = getRequirements();
		if(requirements.length > 0) {
			let fullInfo = 'Пожалуйста заполните необходимую информацию: \n';
			for(let i = 0; i < requirements.length; i++) {
				const reqElement = requirements[i];
				fullInfo += `${reqElement} \n`;
			}

			alert(fullInfo); //Предупреждаем и обрываем старт страницы.
			return;
		}

		//Если все прошло ок, вызываем из обработчика загрузку след страницы:
		ipc.send('goToStream');
	});
	
	avaSelectBtn.addEventListener('click', () => {
		ipc.send('open-file-dialog');
	});

	cameraSelection.addEventListener('change', () => {
		const text = cameraSelection.options[cameraSelection.selectedIndex].text;
		ipc.send('camera-changed', text);
	});	

	audioSelection.addEventListener('change', () => {
		const text = audioSelection.options[audioSelection.selectedIndex].text;
		ipc.send('audio-changed', text);	
	})

	const streamerNameInputText = document.getElementById('streamerNameInputText');
	streamerNameInputText.addEventListener('change', () => {
		ipc.send('streamerNameChanged', streamerNameInputText.value);
	});

	$('#backBtn').click(function(){
		ipc.send('backBtnClicked');
	});
	//at start send default value from inputText
	const delayToUpdateDefaultValue = 1000;
	setTimeout(() => {	
		ipc.send('streamerNameChanged', streamerNameInputText.value);	
	}, delayToUpdateDefaultValue)
});

// ### Client event subscriber handlers ###
ipc.on('camera-list-update', (event, args) => {
	const camData = args;	
	$('#cameraSelection').empty();
	$.each(camData, function(key, value) {   
		$('#cameraSelection')
			.append($("<option></option>")
						.attr("value",value.name)
						.text(value.name)); 
	});
});

ipc.on('audio-list-update', (event, args) => {
	const audioData = args;
	$('#audioSelection').empty();
	$.each(audioData, function(key, value) {   
		$('#audioSelection')
			.append($("<option></option>")
						.attr("value",value.name)
						.text(value.name)); 
	});
});

//When user selected file for ava
ipc.on('selected-file', (event, args) => {
	const avaImg = document.getElementById('streamerAvaImg');
    const base64img = args;
    avaImg.src = `data:image/png;base64,${base64img}`;
});

ipc.on('update-requirements', (event, args) => {
	userRequirements = args; //empty list firstable
})


