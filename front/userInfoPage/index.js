const electron = require('electron');
const ipc = electron.ipcRenderer;

document.addEventListener('DOMContentLoaded', () => {

    const chooiseAvaBTN = document.getElementById('chooiseUserAvaBtn');
    chooiseAvaBTN.addEventListener('click', () => {
        ipc.send('open-user-ava');
    });

    const userNameInputText = document.getElementById('userName');
	userNameInputText.addEventListener('change', () => {
		ipc.send('userNameChanged', userNameInputText.value);
    });
    
    const userNickNameInputText = document.getElementById('userNickName');
    userNickNameInputText.addEventListener('change', () => {
		ipc.send('userNicknameChanged', userNickNameInputText.value);
    });
    
    const createAccountBtn = document.getElementById('createAccountBtn');
    createAccountBtn.addEventListener('click', () => {
        const userValues = {
            "nickName":userNickNameInputText.value,
            "userName":userNameInputText.value
        }
        ipc.send('update-info', userValues);
        ipc.send('openGlobalRoomPage');
    });
    
});

ipc.on('selected-userava-file', (event, args) => {
    const avaImg = document.getElementById('userAvaImg');
    avaImg.src = './img/' + args + '?v' + Date.now();;
});