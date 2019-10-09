//Routes
const userInfoRouter = require('./userInfoRouter');
const streamerInfoRouter = require('./streamerInfoRouter');

const URLS = {
    USER: '/user',
    STREAM_INFO: '/streamInfo'
};

function useGlobalRouter(expressApp) {
    expressApp.use(URLS.USER, userInfoRouter);
    expressApp.use(URLS.STREAM_INFO, streamerInfoRouter);
}

module.exports = {
    useGlobalRouter
};