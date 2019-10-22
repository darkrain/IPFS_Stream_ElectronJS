const fs = require('fs');

async function createM3UFileIfNotExistsAsync(m3uPath, chunks = null) {
    await new Promise((resolve, rejected) => {
        if(!fs.existsSync(m3uPath)) {
            const baseContent = `#EXTM3U\r\n#EXT-X-VERSION:3\r\n#EXT-X-TARGETDURATION:8\r\n#EXT-X-MEDIA-SEQUENCE:0\r\n#EXT-X-PLAYLIST-TYPE:EVENT\r\n`;
            try{
                fs.appendFileSync(m3uPath, baseContent);
                resolve();
            }catch(err) {
                rejected(err);
            }
        } else {
            resolve();
        }
    });

    if(chunks) {
        for(let i = 0; i < chunks.length; i++) {
            const chunkData = chunks[i];
            await new Promise((resolve, rejected) => {
                const extInf = `#${chunkData.EXTINF},\r\n`;
                const chunkName = chunkData.FILE_NAME + '\r\n';
                try {
                    fs.appendFileSync(m3uPath, extInf);
                    fs.appendFileSync(m3uPath, chunkName);
                    resolve();
                } catch(err) {
                    rejected(err);
                }
            });
        }
    }
}

async function updateM3UFileAsync(chunkData, m3uPath) {
    try {
        await createM3UFileIfNotExistsAsync(m3uPath);
        await new Promise((resolve, rejected) => {
            const extInf = `#${chunkData.extInf},\r\n`;
            const chunkName = chunkData.fileName + '\r\n';
            try {
                fs.appendFileSync(m3uPath, extInf);
                fs.appendFileSync(m3uPath, chunkName);
                resolve();
            } catch(err) {
                rejected(err);
            }
        });
    } catch(err) {
        console.error("Unable handle creation of m3ufile: \n" + err.toString());
        throw err;
    }
}
module.exports = {
    createM3UFileIfNotExistsAsync,
    updateM3UFileAsync
};