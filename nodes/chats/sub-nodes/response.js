var moment = require('moment');

// HARDCODED; FIX IT
var baseUser = {
    _id: "",
    name: "",
    image: ""
};

var baseResponse = {
    ref: "",
    text: "",
    time: "",
    isMe: false,
    avatar: baseUser
}

module.exports = function(messageDetails){

    var content = Object.assign({}, baseResponse);

        content.ref    = messageDetails.chatRef;
        content.text   = messageDetails.text;
        content.time   = messageDetails.time;
        content.isMe   = messageDetails.destinationUserId == messageDetails.senderAvatar._id;
        content.avatar = messageDetails.senderAvatar;

    return content;
}