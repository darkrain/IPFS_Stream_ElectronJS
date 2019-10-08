const electron = require('electron');
const ipc = electron.ipcRenderer;
const currentUserInfo = { };
document.addEventListener('DOMContentLoaded', () => {
    const userAvaElement = document.getElementById('userAvaImg');
    const chooiseAvaInput = document.getElementById('chooiseUserAvaBtn');
    chooiseAvaInput.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            currentUserInfo.photoBase64 = reader.result.replace('data:image/png;base64,', ''); //remove unecessary data for user
            userAvaElement.src = reader.result;
        };
        reader.onerror = (err) => {
            //TODO handle error
        }
    };

    const userNameInputText = document.getElementById('userName');
	userNameInputText.addEventListener('change', () => {
        //TODO realize logic in client
    });
    
    const userNickNameInputText = document.getElementById('userNickName');
    userNickNameInputText.addEventListener('change', () => {
        //TODO realize logic in client
    });
    
    const createAccountBtn = document.getElementById('createAccountBtn');
    createAccountBtn.addEventListener('click', () => {
        //TODO realize logic in client
        const isReady = true; //TEST
        if(isReady)
            ipc.send('openGlobalRoomPage');
    });
    
});

function sendUserData() {
    //TODO send object to local server
    const requestUrl = 'localhost:4000/user/create';
    const userObj = {
        name: document.getElementById('userName').value,
        nickname: document.getElementById('userNickName').value,
        binaryPhotoContent: '' // << Raw image data from browser
    };
}

ipc.on('nameChanged', (event, args) => {
    const userNameInputText = document.getElementById('userName');
    userNameInputText.value = args;
});

ipc.on('nickNameChanged', (event, args) => {
    const userNickNameInputText = document.getElementById('userNickName');
    userNickNameInputText.value = args;
});


ipc.on('selected-userava-file', (event, args) => {
    const avaImg = document.getElementById('userAvaImg');
    const base64img = args;
    avaImg.src = `data:image/png;base64,${base64img}`;
});