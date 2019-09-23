const appNavigator = require('../../appNavigator.js');

module.exports = {
    loadPageByName: (pageName, pageArgs) => {
        appNavigator.loadPageByName(pageName, pageArgs);
    },
    loadDefaultPage: () => {
        appNavigator.loadDefaultPage();
    }
}