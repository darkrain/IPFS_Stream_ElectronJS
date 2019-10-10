//THIS TEST check for _currentPage link in interval;
const TEST_NAME = '[| APP_NAVIGATOR DYNAMIC MODULE TEST |]';
const appNavigator = require('../../appNavigator');
const DELAY = 5000;

function start() {
    setInterval(() => {
        const currentPage = appNavigator.getCurrentPage();
        const name = currentPage ? currentPage.constructor.name : undefined;
        console.log(`${TEST_NAME} CURRENT PAGE NOW: ${name}`);
    }, DELAY);
}

module.exports = {
    start
};

