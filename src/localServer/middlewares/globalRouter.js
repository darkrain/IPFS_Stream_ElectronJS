const createUser = require('./createUser');

function useGlobalRouter(expressApp) {
    expressApp.use('/createUser', (req, res, next) => {
        res.send(JSON.stringify(createUser()));
        next();
    });
}

module.exports = {
    useGlobalRouter
};