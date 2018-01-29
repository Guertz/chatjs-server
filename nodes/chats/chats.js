const ChatFactory = require('../../models/chat.js');
var UserFactory = require('../../models/user.js');
var ChatNode = require('./sub-nodes/chat.js');

var transport = require('../../helper/connection.js');

var getRequests = require('./request.js');
var getResponse = require('./response.js');

const userActionList = { 'connect': true, 'create': true };

var userAvailableList = {};

module.exports = function(wss, WebSocketServer, server){ 

    wss['chats'] = {};
    
    wss.on('connection', function(ws) {

        var _id = false;

        var _ubind = function(){
            if(_id) {
                userAvailableList[_id] = false;
                _id = false;
            }
        }

        ws.on('message', function(data, flag){
            
            // Complete responses send cases
            // Better handling different response types on client
            // Default error/response when you dont know the type?
            //      => error handler switch
            transport.request(data, flag, userActionList).then(
                (RequestHandler) => {
                    
                    var content = RequestHandler.getRequest(getRequests());
                    if(!RequestHandler.hasErrors()){
                        switch(content.type) {
                            case "connect":
                                _id = RequestHandler.getAuth().key;
                                userAvailableList[_id] = ws;

                                break;
                            case "create":

                                if(userAvailableList[content.destination] &&
                                    userAvailableList[_id]) {

                                    var userInstance = (new UserFactory());
                                    var chatInstance = (new ChatFactory());
                                        chatInstance.randomToken();
                                        chatInstance.creator = _id;
                                    
                                    // Force source details in message (since already know from auth_key)
                                    content.source = _id;

                                    wss['chats'][chatInstance._ref] = new WebSocketServer({server: server, path: '/chats/'+chatInstance._ref });
                                        new ChatNode(wss['chats'][chatInstance._ref], chatInstance._ref);

                                    var prepareResponse = function(source, dest) {
                                        
                                        transport.response.send(
                                            transport.response.createSuccess(
                                                getResponse(source, dest, chatInstance), 
                                                "create"), 
                                            userAvailableList[dest._id]);
                                    }

                                    var _promises = [];
                                        _promises.push(userInstance.loadAttributes(content.destination, true, 'clean'));
                                        _promises.push(userInstance.loadAttributes(content.source, true, 'clean'));
                                    
                                    Promise.all(_promises).then( values => {
                                        prepareResponse(values[0], values[1]);
                                        prepareResponse(values[1], values[0]);
                                    });

                                } else {

                                }
                                break;
                            default:
                                console.log("Unhandled switch content.type request");
                                break;
                        }
                    } else {

                    }
                    
                },
                (error) => {
                    // transport.response.send(transport.response.createError(error), ws);
                }
            );
                                
        });


        ws.on('close', function() {
            _ubind();
        });

        ws.on('error', function(e) {
            _ubind();
        });
        
    });
};