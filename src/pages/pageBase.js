const appNavigatorMediator = require('../mediators/appNavigatorMediator.js');
const GLOBAL_PAGE_NAME = 'globalRoomPage';
class PageBase {
    constructor() {
        this.isEnabled = true;
    };
    stop() {
        this.isEnabled = false;
    }
    setEnabled(isEnabled) {
        this.isEnabled = isEnabled;
    }
    isEnabled() {
        return this.isEnabled;
    }
    goToPage(pageName, args) {
        console.log(`Go to ${pageName} page!`);
        appNavigatorMediator.loadPageByName(pageName, args);
    }
    goToGlobalPage() {
        console.log("Go to global page!");
        appNavigatorMediator.loadPageByName(GLOBAL_PAGE_NAME,null);
    }
}

module.exports = PageBase;