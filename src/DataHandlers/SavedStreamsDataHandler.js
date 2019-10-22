const DataHandlerBase = require('./DataHandlerBase');
const appConfig = require('../../appFilesConfig');

class SavedStreamsDataHandler extends DataHandlerBase {
    constructor() {
        super(appConfig.files.SAVED_STREAMS_DATA_JSON_PATH);
    }

    async getRecordDataByKeyAsync(recordKey) {
        const dataArr = await this.readDataAsync();
        const neededStreamerDataIndex = dataArr.findIndex(data => {
            return data.recordKey === recordKey;
        });
        return dataArr[neededStreamerDataIndex];
    }
}

module.exports = SavedStreamsDataHandler;