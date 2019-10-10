

class PageGetter {
    static PageTypes = {
        USER_INFO_PAGE: 'userInfoPage',
        STREAMING_PAGE: 'streamingPage',
        GLOBAL_ROOM_PAGE: 'globalRoomPage',
        STREAM_WATCH_PAGE: 'streamWatchPage',
        STREAMER_INFO_PAGE: 'streamerInfoPage'
    };

    static getConstructorName(pageType) {
        switch (pageType) {
            case this.PageTypes.USER_INFO_PAGE: {
                return 'UserInfoPage';
            }
            case this.PageTypes.STREAMING_PAGE: {
                return 'StreamPage';
            }
            case this.PageTypes.GLOBAL_ROOM_PAGE: {
                return 'GlobalRoomPage';
            }
            case this.PageTypes.STREAM_WATCH_PAGE: {
                return 'StreamWatchPage';
            }
            case this.PageTypes.STREAMER_INFO_PAGE: {
                return 'StreamerInfoPage';
            }
            default: {
                return null;
            }
        }
    }
    static getCurrentPageWithType(pageType ) {
        const explicitPage = require('../../../appNavigator').getCurrentPage();
        if(!explicitPage || explicitPage.constructor.name !== this.getConstructorName(pageType)) {
            console.error(`Unable to get page with type: ${pageType} , current page is ${explicitPage}`);
            return null;
        }
        console.log(`Get page by type ${pageType} succefull!`);
        return explicitPage;
    }
}

module.exports = PageGetter;