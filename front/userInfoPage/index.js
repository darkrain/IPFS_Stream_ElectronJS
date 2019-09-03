const electron = require('electron');
const ipc = electron.ipcRenderer;

const STREAMING_PAGE = 'streamingPage';

document.addEventListener('DOMContentLoaded', () => {
    const goToPageBtn = document.getElementById('goToPageBtn');
    goToPageBtn.addEventListener('click', () => {
        ipc.send('goto-page', STREAMING_PAGE);
    });
});