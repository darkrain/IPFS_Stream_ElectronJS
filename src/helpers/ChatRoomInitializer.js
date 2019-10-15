const ChatRoom = require('../data/ChatRoom');
const userInfoLoader = require('../data/userInfoLoader');
const appConfig = require('../../appFilesConfig');

class ChatRoomInitializer {
    constructor(ipfs, ipc, win,streamerInfo) {
        this.ipc = ipc;
        this.ipfs = ipfs;
        this.win = win;
        this.streamerInfo = streamerInfo;
        this.userName = 'UNKNOWN_NAME';
        
        userInfoLoader.getUserInfoData(appConfig.files.USERINFO_JSON_PATH).then((data) => {
            this.userName = data && data.nickname ? data.nickname : 'UNKNOWN_USER';
        })
            .catch((err) => {
                console.error(`Unable to get USER Name!: ${err.message}`);
            });
    }
    initialize() {
        const chatRoomInitializerObj = this;
        this.streamChatRoom = new ChatRoom(this.ipfs, this.streamerInfo.hashOfStreamer);
        this.streamChatRoom.chatRoomEvent.on('onMessage', async messageData => {
            this.ipfsID = await new Promise(resolve => {
                chatRoomInitializerObj.ipfs.id((err, res) => {
                    if(err) throw err;
                    resolve(res.id);
                });
            });
            const isMyMessage = messageData.from === this.ipfsID;
            messageData.isMyMessage = isMyMessage;
            chatRoomInitializerObj.win.webContents.send('chatMessageGetted', messageData);
        });
        //when you try to send message
        this.ipc.on('onMessageSend', (event, msgText) => {
            const msgData = {
                from: this.ipfsID,
                userName: this.userName,
                message: msgText
            }
            chatRoomInitializerObj.streamChatRoom.sendMessage(msgData);
        });
    }
}
module.exports = ChatRoomInitializer;