const assert = require('assert');
const SavedStreamDataHandler = require('../src/DataHandlers/SavedStreamsDataHandler');

describe('Test functions from data handlers', () => {
    const dataHandler = new SavedStreamDataHandler();
    it('Should clear file correct', async () => {
        try {
            await dataHandler.clearAsync();
            assert.ok(true);
        } catch(err) {
            assert.fail(err.message);
        }
    });

    it('Should write data correct', async () => {
        try {
            await dataHandler.clearAsync();
            await dataHandler.saveDataAsync({name: "vova"});

            const currentDataArr = await dataHandler.readDataAsync();
            const firstName = currentDataArr[0].name;
            assert.equal(firstName, "vova");

        } catch(err) {
            assert.fail(err.message);
        }
    });

    it('Should append data correct', async () => {
        try {
            await dataHandler.clearAsync();
            await dataHandler.saveDataAsync({name: "vova"});
            await dataHandler.appendDataAsync({name: "XXX"});
            await dataHandler.appendDataAsync({name: "ZZZ"});
            const currentDataArr = await dataHandler.readDataAsync();
            const newItemName = currentDataArr[2].name;
            assert.equal(newItemName, "ZZZ");

        } catch(err) {
            assert.fail(err.message);
        }
    });
});