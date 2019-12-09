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
    const args = gameEventObj.args;
    const gameButtons = document.getElementById('gameButtons');

    const cardDiv = document.createElement('div');
    cardDiv.className = "card text-white bg-secondary mb-3";
    cardDiv.style.cssText = "width: 300px; margin-top: 10px;";
    const cardBody = document.createElement('div');
    cardBody.className = "card-body";

    const gameEventNameElem = document.createElement('h4');
    gameEventNameElem.innerText = gameEventObj.prettyViewName;
    const header = document.createElement('div');
    header.className = "card-header";
    header.appendChild(gameEventNameElem);
    const button = document.createElement('button');
    button.type = 'button';
    button.id = gameEventObj.name;
    button.setAttribute('data-dismiss', 'modal');
    button.className = "btn btn-dark";
    button.innerText = "Добавить";

    cardDiv.appendChild(header);
    cardDiv.appendChild(cardBody);
    if(args !== null) {
        createPropertiesForGameEventArgs(args, cardBody);
    }
    const footer = document.createElement('div');
    footer.className = 'card-footer';

    footer.appendChild(button);
    cardDiv.appendChild(footer);
    gameButtons.appendChild(cardDiv);

    button.onclick = function() {
        onGameChoiced(gameEventObj);
    }
    
}

function createPropertiesForGameEventArgs(gameEventArgs, containerToAppend) {
    for(const property of gameEventArgs) {
        const div = document.createElement('div');
        const nameElem = document.createElement('p').appendChild(document.createElement('b'));
        nameElem.innerText = `${property.prettyViewName + ':  '}`;
        
        const inputElem = document.createElement('input');
        inputElem.type = 'text';
        inputElem.maxLength = 4;
        inputElem.size = 4;
        inputElem.id = getIdOfGameEventInputProperty(property.name);
        inputElem.value = property.value;

        inputElem.onchange = function() {
            const value = Number(inputElem.value);
            if(value) {
                property.value = inputElem.value;
            } else {
                property.value = null;
            }
            console.log(`Param ${property.name} changed!`);        
        }

        nameElem.appendChild(inputElem);
        div.appendChild(nameElem);
        containerToAppend.appendChild(div);
    }
} 

function getIdOfGameEventInputProperty(property) {
    return `prop${property.name}`;
}

function onGameChoiced(gameEventObj) {
    console.log(`Game choiced! \n${JSON.stringify(gameEventObj)}`);
    const gameEventNameElem = document.getElementById('currentGameEventName');
    gameEventNameElem.innerText = gameEventObj.prettyViewName;
    const gameProperties = gameEventObj.args;
    let valueToSend = gameEventObj;
    if(gameProperties && gameProperties.length > 0) {
        for(const prop of gameProperties) {
            if(prop.value) {
                gameEventNameElem.innerText += `\n ${prop.prettyViewName} : ${prop.value}`;
            } else {
                valueToSend = null;
                break;
            }
        }
    }
    

    ipc.send('gameDataChoiced', valueToSend);
    if(valueToSend === null)
        gameEventNameElem.innerText = 'NONE';
}
