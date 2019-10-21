const fs = require('fs');

class DataHandlerBase {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async saveDataAsync(obj) {
        try {
            const isFileExists = await new Promise((resolve) => {
                const isExists = fs.existsSync(this.filePath);
                resolve(isExists);
            });
            if(isFileExists) {
                await this.appendDataAsync(obj);
            } else {
                await this.writeDataAsync([obj]);
            }
        } catch(err) {
            throw err;
        }
    }

    writeDataAsync(obj) {
        return new Promise((resolve, rejected) => {
            try {
                const objStr = JSON.stringify(obj);
                fs.writeFile(this.filePath, objStr, 'utf8', (err) => {
                    if(err)
                        rejected(err);
                    resolve();
                });
            } catch(err) {
                rejected(err);
            }
        });
    }

    async appendDataAsync(obj) {
        try {
            const fileDataArray = await this.readDataAsync();
            fileDataArray.push(obj);

            await this.writeDataAsync(fileDataArray);

        } catch(err) {
            throw err;
        }
    }

    async readDataAsync() {
        if(!fs.existsSync(this.filePath)) {
            return [];
        }
        const fileDataArray = await new Promise((resolve, rejected) => {
            fs.readFile(this.filePath, {encoding: 'utf8'}, (err, data) => {
                if(err) {
                    rejected(err);
                }
                try{
                    const objectFromStr = JSON.parse(data.toString());
                    resolve(objectFromStr);
                } catch (err) {
                    rejected(err);
                }
            });
        });

        return fileDataArray;
    }

    clearAsync() {
        return new Promise((resolve) => {
            if(fs.existsSync(this.filePath)) {
                fs.unlinkSync(this.filePath);
                resolve();
            } else {
                resolve();
            }
        })
    }
}

module.exports = DataHandlerBase;