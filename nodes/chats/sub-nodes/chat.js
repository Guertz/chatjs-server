const MessageFactory = require('../../../models/message.js');

var transport = require('../../../helper/connection.js');

var getRequests = require('./request.js');
var getResponse = require('./response.js');

// Next time i'm going to use firebase
const userActionList = { 'join': true, 'send': true };

module.exports = function(wss, _ref){ 

    // _ubind?
    var userInThisChat = {};

    wss.on('connection', function(ws) {

        ws.on('message', function(data, flag) {
            transport.request(data, flag, userActionList).then(
                (RequestHandler) => {
                    
                    var content = RequestHandler.getRequest(getRequests());
                    if(!RequestHandler.hasErrors()){
                        switch(content.type){
                            case 'join':

                                userInThisChat[RequestHandler.getAuth().key] = ws;
                                break;    

                            case 'send':

                                console.log("Text: " + content.text);
                                
                                var messageBlock = (new MessageFactory( 
                                                        {_ref: _ref}, 
                                                        RequestHandler.getAuth().user,
                                                        content.text));

                                Object.keys(userInThisChat)
                                    .forEach((chatUserId) => {

                                        messageBlock.destinationUserId = chatUserId;
                                        transport.response.send(
                                            transport.response.createSuccess(
                                                getResponse(messageBlock), 
                                                "send"), 
                                            userInThisChat[chatUserId]);
                                    });

                                break;   
                        }
                    } else {

                    }
                },
                (error) => {

                }
            );
        })
    });
};