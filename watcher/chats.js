const ChatFactory = require('../models/chat.js');
var UserFactory = require('../models/user.js');
var moment = require('moment');

// TODO: handle close, disconnect or errors
module.exports = function(wss, _ref){ 

    var userInThisChat = {};

    wss.on('connection', function(ws) {

        ws.on('message', function(data, flag){

            if(!flag.binary){
                var _localErrors = false;

                try{
                    var msg = JSON.parse(data); 
                }catch(err){
                    _localErrors = true;           
                }

                if(!_localErrors){
                    if(msg.type && msg.content){
                        switch(msg.type){
                            case 'join':
                                userInThisChat[msg.content._id] = ws;
                                break;    
                            case 'send':
                                var userInstance = (new UserFactory());
                                    
                                userInstance.loadAttributes(msg.auth.key, true, 'clean')
                                  .then((sender) => {
                                    Object.keys(userInThisChat).forEach( (user) => {

                                        userInThisChat[user].send(JSON.stringify({
                                            ref: _ref,
                                            msg: (new ChatFactory()).msgTok(),
                                            data: {
                                                content: msg.content.text,
                                                time: moment().locale('it').format('HH:mm'),
                                                isMe: msg.auth.key == user,
                                                sender: sender
                                            }
                                        }))
                                    });
                                  });
                                break;   
                        }
                    }
                }
            }
 
        });

    });
};