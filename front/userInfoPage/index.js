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
        currentUserInfo.name = userNameInputText.value;
    });
    
    const userNickNameInputText = document.getElementById('userNickName');
    userNickNameInputText.addEventListener('change', () => {
        currentUserInfo.nickname = userNickNameInputText.value;
    });
    
    const createAccountBtn = document.getElementById('createAccountBtn');
    createAccountBtn.addEventListener('click', () => {
        //TODO realize logic in client
        sendUserData(); //TEST
    });

    function sendUserData() {
        //TODO send object to local server
        const requestUrl = 'http://localhost:4000/user';
        $.post( requestUrl, currentUserInfo)
            .done(function( data ) {
                alert( "Data Loaded: " + JSON.stringify(data) );
                if(data.status === 'SUCCESS')
                    ipc.send('openGlobalRoomPage');
            })
            .fail(function () {
                alert("ERROR");
            });
    }
});

