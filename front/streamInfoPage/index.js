const electron = require('electron');
const ipc = electron.ipcRenderer;
const requestUrl = 'http://localhost:4000/streamInfo';

window.gameDataObj = [];

$( document ).ready(function() {
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
    
    ipc.on('gameEventsContentUpdated', (event, args) => {
        const gameEventsObjCollection = args;
        for(let gameData of gameEventsObjCollection) {
            initializeGameEventObjAsView(gameData);
        }
    })

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

function initializeGameEventObjAsView(gameEventObj) {
    console.log(`GameEventObj initialized: \n${JSON.stringify(gameEventObj)}`);
    //TODO realize render as buttons
    const gameButtons = document.getElementById('gameButtons');
    console.log(`Game Buttons: \n ${gameButtons}`);
    const container = document.createElement('div');
    container.style.cssText = 'margin-top:10px;';
    const button = document.createElement('button');
    button.type = 'button';
    button.id = gameEventObj.name;
    button.setAttribute('data-dismiss', 'modal');
    button.className = "btn btn-accent";
    button.innerText = gameEventObj.prettyViewName;
    container.appendChild(button);
    gameButtons.appendChild(container);
    button.onclick = function() {
        onGameChoiced(gameEventObj);
    }
}

function onGameChoiced(gameEventObj) {
    console.log(`Game choiced! \n${JSON.stringify(gameEventObj)}`);
    document.getElementById('currentGameEventName').innerText = gameEventObj.prettyViewName;
    ipc.send('gameDataChoiced', gameEventObj);
}
