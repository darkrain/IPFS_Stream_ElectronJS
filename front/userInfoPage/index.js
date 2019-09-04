const electron = require('electron');
const ipc = electron.ipcRenderer;


document.addEventListener('DOMContentLoaded', () => {
    const chooiseAvaBTN = document.getElementById('chooiseUserAvaBtn');
    chooiseAvaBTN.addEventListener('click', () => {
        ipc.send('open-user-ava');
    });
});

ipc.on('selected-userava-file', (event, args) => {
    const avaImg = document.getElementById('userAvaImg');
    avaImg.src = './img/' + args + '?v' + Date.now();;
});