const assert = require('assert');
const PageGetter = require('../src/mediators/Singletons/PageGetter');

describe('Test PageGetter static mediator', () => {
    it('Should return correct type for GlobalRoomPage', () => {
        const roomName = PageGetter.getConstructorName(PageGetter.PageTypes.GLOBAL_ROOM_PAGE);
        assert.strictEqual(roomName, 'GlobalRoomPage');
    });
    it('Should return correct type for UserInfoPage', () => {
        const roomName = PageGetter.getConstructorName(PageGetter.PageTypes.USER_INFO_PAGE);
        assert.strictEqual(roomName, 'UserInfoPage');
    });
    it('Should return correct type for StreamPage', () => {
        const roomName = PageGetter.getConstructorName(PageGetter.PageTypes.STREAMING_PAGE);
        assert.strictEqual(roomName, 'StreamPage');
    });
    it('Should return correct type for StreamWatchPage', () => {
        const roomName = PageGetter.getConstructorName(PageGetter.PageTypes.STREAM_WATCH_PAGE);
        assert.strictEqual(roomName, 'StreamWatchPage');
    });
    it('Should return correct type for StreamerInfoPage', () => {
        const roomName = PageGetter.getConstructorName(PageGetter.PageTypes.STREAMER_INFO_PAGE);
        assert.strictEqual(roomName, 'StreamerInfoPage');
    });
});