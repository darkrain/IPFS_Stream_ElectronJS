const express = require("express");
const globalRoutes = require('./middlewares/globalRouter');
const path = require('path');
const bodyParser = require('body-parser');
const debug = true;
let app = null;
let closed = false;
let _streamPath;
function setStaticPath(streamPath) {
    _streamPath = streamPath;
    console.log(`Static path has been changed! ${_streamPath}`);
    if(app != null) {
        //If server already started use middleware about new stream path
        //its necessary because when express.static already defined then not updated.
        app.use(express.static(_streamPath));
    }
}

function startLocalServer() { 

    closed = false;
    app = express(); 
    app.removeAllListeners();
    app.setMaxListeners(0);

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }));
    // parse application/json
    app.use(bodyParser.json());

    if(debug) {
        //check which file being requested
        app.use((req, res, next) =>
        {
            console.log(`Try to get from server|: ${req.url} , \n current path: ${_streamPath} \n ROUTES:`);
            if(closed === true)
                return res.end();

            const fileName = path.basename(req.url);
            const extension = path.extname(fileName);

            if(extension == '.m3u8' || extension == '.ts') {
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
        return;
    });
}

function stopLocalServer() 
{
    if(app)
        app.emit('close', ()=> {});
    app = null;
}

module.exports = {
    startLocalServer,
    stopLocalServer,
    setStaticPath
};

