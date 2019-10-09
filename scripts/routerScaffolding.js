//** SCAFFOLDING FOR CRUD ROUTES ****
const pathModule = require('path');
const fs = require('fs');

const args = process.argv;
const defaultRelativePath = pathModule.join(__dirname.replace('scripts', ''), '/src/localServer/middlewares');
const nameOfRouter = args[2];
let path = args[3];

if(!nameOfRouter) {
    console.error(`There is no name for router!`);
    process.exit(-1);
}
const routerFileName = `${nameOfRouter}Router.js`;
if(!path) {
    path = pathModule.join(defaultRelativePath, routerFileName);
} else {
    path = pathModule.join(path, routerFileName);
}

createRouter();

function createRouter() {
    const fileData = `const express = require('express');
const router = express.Router();
const STATUS = require('../data/apiData').STATUS;
router.post('/', (req, res) => {

});

router.get('/', (req,res) => {

});

router.put('/', (req,res) => {

});

router.delete('/', (req,res) => {

});

module.exports = router;`;

    fs.writeFile(path, fileData, (err) => {
        if(err)
            throw err;
    });
}

