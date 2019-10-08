const createUser = require('./createUser');

function useGlobalRouter(expressApp) {
    expressApp.use('/user', createUser);
}

module.exports = {
    useGlobalRouter
};