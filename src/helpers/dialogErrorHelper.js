const dialog = require('electron').dialog;

function showErorDialog(from, message, isFatal) {
    dialog.showErrorBox(from, message);
    if(isFatal === true)
        process.exit(1);
}

module.exports = {
    showErorDialog
}