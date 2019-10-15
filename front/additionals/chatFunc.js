function addMessageToChat(msgData) {
    console.log(`MSG_DATA Getted! ${JSON.stringify(msgData)}`);
    const isMyMessage = msgData.isMyMessage;
    const from = isMyMessage ? "YOU" : msgData.from;
    const message = msgData.message;
    const chatBodyID = 'chatBody';
    const chatBody = document.getElementById(chatBodyID);
    const messageDiv = document.createElement('div');
    const messageFrom = document.createElement('p');
    const messageText = document.createElement('p');
    messageFrom.textContent = `From: ${from}`;
    messageText.textContent = `Message: ${message}`;
    messageDiv.append(messageFrom);
    messageDiv.append(messageText);
    chatBody.append(messageDiv);
}