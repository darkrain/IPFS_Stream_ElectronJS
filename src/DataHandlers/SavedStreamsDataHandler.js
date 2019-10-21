const DataHandlerBase = require('./DataHandlerBase');
const appConfig = require('../../appFilesConfig');

class SavedStreamsDataHandler extends DataHandlerBase {
    constructor() {
        super(appConfig.files.SAVED_STREAMS_DATA_JSON_PATH);
    }
}

module.exports = SavedStreamsDataHandler;