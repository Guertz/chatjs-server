var moment = require('moment');

function Message(chatInstance, senderAvatar = {}, text = ""){
    this.chatRef = chatInstance._ref;
    this.text = "";
    this.senderAvatar = senderAvatar;
    this.destinationUserId = "";
    this.time = moment().locale('it').format('HH:mm');
}

module.exports = Message;
