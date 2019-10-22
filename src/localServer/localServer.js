const express = require("express");
const globalRoutes = require('./middlewares/globalRouter');
const path = require('path');
const bodyParser = require('body-parser');
const debug = false;
let app = null;
let closed = false;
let _streamPath;
function setStaticPath(streamPath) {
    _streamPath = streamPath;
    if(app != null) {
        //If server already started use middleware about new stream path
        //its necessary because when express.static already defined then not updated.
        app.use(express.static(_streamPath));
        console.log(`Static path has been changed! ${_streamPath}`);
    }
}

function startLocalServer(staticPath) {
    closed = false;
    app = express(); 
    app.removeAllListeners();
    app.setMaxListeners(0);

    //We need a specify
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({limit: '50mb', extended: false }));
    // parse application/json
    app.use(bodyParser.json({limit: '50mb'}));

    if(staticPath) {
        setStaticPath(staticPath);
    }

    if(debug) {
        //check which file being requested
        app.use((req, res, next) =>
        {
            console.log(`Try to get from server|: ${req.url} , \n current path: ${_streamPath} \n ROUTES:`);
            if(closed === true)
                return res.end();

            const fileName = path.basename(req.url);
            const extension = path.extname(fileName);

            if(extension === '.m3u8' || extension === '.ts') {
                const date = new Date();
                const correctTime = `${date.getHours()}h:${date.getMinutes()}m:${date.getSeconds()}s`;
                console.log(`File ${fileName} was requested at ${correctTime}`);
            }
            next();
        });
    }

    app.get('/', (req, res, next) => {
        res.send(`HELLO MAN! Your path: ${_streamPath}`);
        next();
    });

    //subscribe to global routing
    globalRoutes.useGlobalRouter(app);
    app.use(express.static('/'));

    const PORT = 4000;

    const server = app.listen(PORT, () => {
        console.log("SERVER RUNNING!");
    });

    app.on('close', () => {
        console.log(" * * * CLOSE CONNECTION * * *");
        server.close();
        closed = true;
    });
}

function stopLocalServer() {
    if(app)
        app.emit('close', ()=> {});
    app = null;
}

module.exports = {
    startLocalServer,
    stopLocalServer,
    setStaticPath
};

