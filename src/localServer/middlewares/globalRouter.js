//Routes
const userInfoRouter = require('./userInfoRouter');

const URLS = {
    USER: '/user'
};

function useGlobalRouter(expressApp) {
    expressApp.use(URLS.USER, userInfoRouter);
}

module.exports = {
    useGlobalRouter
};