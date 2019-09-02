const express = require("express");
const path = require('path');
const fs = require('fs');
const app = express();
function startLocalServer(streamPath) {    
    //check which file being requested
    app.use((req, res, next) => 
    {
        const fileName = path.basename(req.url);
        const extension = path.extname(fileName);

        if(extension == '.m3u8' || extension == '.ts') {
            const date = new Date();
            const correctTime = `${date.getHours()}h:${date.getMinutes()}m:${date.getSeconds()}s`;
            console.log(`File ${fileName} was requested at ${correctTime}`);

            if(extension == '.m3u8') {           
                //const filePath = path.join(streamPath, fileName);
                //console.log(`Try to read file at path ${filePath}`);
                //showFileInfo(filePath);
            }
        }   
        next();
    });

    app.use(express.static(streamPath));
    app.get('/', (req, res) => {
        res.send(`HELLO MAN! Your path: ${streamPath}`);
    });

    function showFileInfo(filePath) {
        fs.readFile(filePath,'utf8', (err, data) => 
        {
            if(err)
                throw err;

            console.log(data);
        });
    }

    const PORT = 4000;

    const server = app.listen(PORT, () => {
        console.log("SERVER RUNNING!");
        console.log(`Your static path is: ${streamPath}`);
    });

    app.on('close', () => {
        server.close();
    })
}

function stopLocalServer() {
    app.emit('close', ()=> {});
}

module.exports = {
    startLocalServer,
    stopLocalServer
}

