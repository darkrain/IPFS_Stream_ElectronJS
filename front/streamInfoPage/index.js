const electron = require('electron');
const ipc = electron.ipcRenderer;

const currentUserData = {
	streamName: '',
	camera: '',
	audio: '',
	avaBase64: ''
};

const requestUrl = 'http://localhost:4000/streamInfo';

let userRequirements = []; // data requirments for stream to show user when he tap on Start button
document.addEventListener('DOMContentLoaded',function(){
	//the property 'isControl' means that button cannot be pushed more than once...
	const startStreamBtn = document.getElementById('openStreamBtn');
	const avaSelectBtn = document.getElementById('chooiseUserAvaBtn');
	const cameraSelection = document.getElementById('cameraSelection');
	const audioSelection = document.getElementById('audioSelection');
	const streamAvaImage = document.getElementById('streamerAvaImg');

	initializeBasicValuesForOptions(cameraSelection);
	initializeBasicValuesForOptions(audioSelection);

	function getRequirements() {
		let prettyViewReq = [];

		for (let [key, value] of Object.entries(currentUserData)) {
			if(value === '' || value === 'NONE' || !value) {
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
			case "streamName": {
				return 'Название стрима'
			}
			case "avaBase64": {
				return 'Наличие фотографии'
			}
			case "camera": {
				return 'Видео устройство'
			}
			case "audio": {
				return 'Аудио устройство'
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
        onDataUpdated();

        //TODO handle next page opening
		//ipc.send('goToStream');
	});
	
	avaSelectBtn.onchange = e => {
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			currentUserData.avaBase64 = reader.result; //remove unecessary data for user
			streamAvaImage.src = reader.result;
        };
		reader.onerror = (err) => {
			//TODO handle error
		}
	};

	cameraSelection.addEventListener('change', () => {
		const text = cameraSelection.options[cameraSelection.selectedIndex].text;
		console.log(`Cam updated! ${text}`);
		currentUserData.camera = text;
    });

	audioSelection.addEventListener('change', () => {
		const text = audioSelection.options[audioSelection.selectedIndex].text;
		console.log(`Audio updated! ${text}`);
		currentUserData.audio = text;
    });

	const streamerNameInputText = document.getElementById('streamerNameInputText');
	streamerNameInputText.addEventListener('change', () => {
		currentUserData.streamName = streamerNameInputText.value;
		console.log(`Stream name updated! ${currentUserData.streamName}`);
	});

	function onDataUpdated() {
		$.post( requestUrl, currentUserData)
			.done(function( data ) {
				console.log( "Data Loaded: " + JSON.stringify(data) );
			})
			.fail(function () {
                console.log("ERROR");
			});
	}

	$('#backBtn').click(function(){
		ipc.send('backBtnClicked');
	});

	ipc.on('camera-list-update', (event, args) => {
		const selectionID = '#cameraSelection';
		const firstValue = initializeSelectionData(selectionID, args);
		currentUserData.camera = firstValue;
	});

	ipc.on('audio-list-update', (event, args) => {
		const selectionID = '#audioSelection';
		const firstValue = initializeSelectionData(selectionID, args);
		currentUserData.audio = firstValue;
	});

	function initializeSelectionData(selectionID, valuesArr) {
		$(selectionID).empty();
		if(valuesArr.length <= 0) {
			valuesArr.unshift('NONE'); // << should add some item to access 'change' event;
		}
		$.each(valuesArr, function(key, value) {
			$(selectionID)
				.append($("<option></option>")
					.attr("value",value)
					.text(value));
		});

		return valuesArr[0];
	}

	function initializeBasicValuesForOptions(selection) {
		const baseOption = 'NONE';
		$(selection)
			.append($("<option></option>")
				.attr("value",baseOption)
				.text(baseOption));
	}
});

// ### Client event subscriber handlers ###





