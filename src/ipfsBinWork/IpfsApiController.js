const request = require('request');

class IpfsApiController {
    constructor(ipfsBinRunner) {
        this.ipfsBinRunner = ipfsBinRunner;
        this.API_URL = {
            GET: null, //method GET
            ADD: null //method POST
        }
        this.fullUrl = this.ipfsBinRunner.getUrl();
        this.API_URL.GET = `${this.fullUrl}api/v0/get`;
        this.API_URL.ADD = `${this.fullUrl}api/v0/add`;
    }
}

module.exports = IpfsApiController();

