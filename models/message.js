var moment = require('moment');

function Message(chatInstance, senderAvatar = {}, text = ""){
    this.chatRef = chatInstance._ref;
    this.text = text;
    this.senderAvatar = senderAvatar;
    this.destinationUserId = "";
    this.time = moment().locale('it').add(1, 'h').format('HH:mm');
}

module.exports = Message;
