const ChatRoom = require('../data/ChatRoom');

class ChatRoomInitializer {
    constructor(ipfs, ipc, win,streamerInfo) {
        this.ipc = ipc;
        this.ipfs = ipfs;
        this.win = win;
        this.streamerInfo = streamerInfo;
    }
    initialize() {
        const chatRoomInitializerObj = this;
        this.streamChatRoom = new ChatRoom(this.ipfs, this.streamerInfo.hashOfStreamer);
        this.streamChatRoom.chatRoomEvent.on('onMessage', async messageData => {
            const ipfsID = await new Promise(resolve => {
                chatRoomInitializerObj.ipfs.id((err, res) => {
                    if(err) throw err;
                    resolve(res.id);
                });
            });
            const isMyMessage = messageData.from === ipfsID;
            messageData.isMyMessage = isMyMessage;
            chatRoomInitializerObj.win.webContents.send('chatMessageGetted', messageData);
        });
        //when you try to send message
        this.ipc.on('onMessageSend', (event, msgText) => {
            chatRoomInitializerObj.streamChatRoom.sendMessage(msgText);
        });
    }
}
module.exports = ChatRoomInitializer;