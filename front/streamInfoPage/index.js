const electron = require('electron');
const ipc = electron.ipcRenderer;
const requestUrl = 'http://localhost:4000/streamInfo';

window.gameDataObj = [];

const gameEventPrototype = {
    nameID: null,
    prettyViewName: null, 
    gameEventDescription: null
}

$( document ).ready(function() {

    subscribeToGameDataUiHandlers();

    const imageOpts = {
        width: 350,
        height: 250,
        aspectRatio: 16 / 9
    };
    let currentImageCropper = null;
	$('#backBtn').click(function(){
		ipc.send('backBtnClicked');
	});

    $('#upload').click(() => {
        $('#chooiseUserAvaBtn').click()
    })

    $('#chooiseUserAvaBtn').change((event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            $('#upload').attr('src', reader.result)
            $('[name="avaBase64"]').val( reader.result ); //remove unecessary data for user
            currentImageCropper = initializeImageCropper('upload', imageOpts);
        };
        reader.onerror = (err) => {
            //TODO handle error
        }
    })
    
    //default quality
    ipc.send('onQualityChanged', 30);
	
	ipc.on('camera-list-update', (event, args) => {
	    console.log(`CAMERAS GETTED: \n ${args}`);
		initializeSelectionData('#cameraSelection', args);
	});

	ipc.on('audio-list-update', (event, args) => {
		initializeSelectionData('#audioSelection', args);
    });
    
    const qualityRangeSlider = document.getElementById('steramQualityInput');
    qualityRangeSlider.onchange = function(){
        const maxValue = 51;
        const sliderValue = Number(this.value);
        const inversedValue = (maxValue + 1) - sliderValue; 
        console.log(`Slider changed ${inversedValue}`);
        ipc.send('onQualityChanged', inversedValue);
    }

    $('form').submit((event) => {
        event.preventDefault();
        if(currentImageCropper) {
            const croppedData = currentImageCropper.getCroppedCanvas({maxWidth: imageOpts.width, maxHeight: imageOpts.height}).toDataURL('image/jpeg');
            $('[name="avaBase64"]').val(croppedData);
        }

        let form = $(event.target);
        let formData = getFormData(form);

        sendFormData(requestUrl, formData, (result) => {
            if(result.status === 'SUCCESS'){
                ipc.send('goToStream');
            }else{
                let textErr = '';
                for( i in result.body ){
                    textErr += result.body[i].name+", ";
                }
                toastr["error"](textErr, "Не заполнены поля")
            }
                
        });
    })

    //test
    //GAME_EVENTS_DATA['smartContractGame']();
})

function subscribeToGameDataUiHandlers() {
    const createEventBtn = document.getElementById('createGameEventBtn');
    createEventBtn.onclick = function() {
        const prettyViewNameValue = document.getElementById('gameEventPrettyViewName').value;
        const gameEventDescription = document.getElementById('gameEventDescription').value;
        
        //try to create event 
        if(prettyViewNameValue) {
            const gameEventObj = createCustomGameEvent({
                name: 0,
                prettyViewName: prettyViewNameValue,
                gameEventDescription: gameEventDescription
            });
            onGameChoiced(gameEventObj);
        } else {
            console.error(`Cannot create gameEventObject!`);
            onGameChoiced(null);
        }
    }
}

function onGameChoiced(gameEventObj) {
    const gameEventNameElem = document.getElementById('currentGameEventName');
    if(gameEventObj === null) {
        gameEventNameElem.innerText = 'NONE';
        return;
    }
        
    console.log(`Game choiced! \n${JSON.stringify(gameEventObj)}`);
    gameEventNameElem.innerText = gameEventObj.prettyViewName;
    const description = gameEventObj.gameEventDescription;
    let croppedDescription = null;
    if(description && description.length > 0) {
        croppedDescription = description.substring(0,description.length / 2 );
        gameEventNameElem.innerText += `\n Описание: ${croppedDescription}...`;
    }
    
    ipc.send('gameDataChoiced', gameEventObj);
}

function createCustomGameEvent(opt) {
    const protoype = Object.assign({}, gameEventPrototype);
    protoype.nameID = opt.nameID;
    protoype.prettyViewName = opt.prettyViewName;
    protoype.gameEventDescription = opt.gameEventDescription;
    return protoype;
}
