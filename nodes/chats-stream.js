const handleMalformed = require('../models/socketHelper').throwSocketMalformedException;
const formatResponseOutput = require('../models/socketHelper').formatResponseOutput;
const ack = require('../models/socketHelper.js').ack;

const ChatFactory = require('../models/chat.js');
var UserFactory = require('../models/user.js');
var ChatNode = require('./chats.js');

var userAvailableList = {};

module.exports = function(wss, WebSocketServer, server){ 

    wss['chats'] = {};
    
    wss.on('connection', function(ws) {
        var _refe = false;

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
                            case 'connect':
                                _refe = msg.content._id;
                                userAvailableList[msg.content._id] = ws;
                                
                                break;
                            
                            case 'create':
                                
                                if(
                                    userAvailableList[msg.content.destination]
                                        &&
                                    userAvailableList[_refe]
                                ){
                                    var userInstance = (new UserFactory());
                                    var chatInstance = (new ChatFactory());
                                        chatInstance.randomToken();

                                    msg.content.source = _refe;

                                    wss['chats'][chatInstance._ref] = new WebSocketServer({server: server, path: '/chats/'+chatInstance._ref });
                                        new ChatNode(wss['chats'][chatInstance._ref], chatInstance._ref);

                                    var populateDataRespAndSend =  function(source, dest){
                                        var _t_DAT = {
                                            reference: chatInstance._ref,
                                            destination: dest.id,
                                            from: source.id,
                                            creator: _refe,
                                            jsonArgs: {
                                                from: source,
                                                destination: dest
                                            }
                                        };

                                        console.log("Sending to: "+_t_DAT.jsonArgs.destination.name);

                                        userAvailableList[_t_DAT.destination].send(JSON.stringify(formatResponseOutput(_t_DAT)));
                                    };

                                    var _promises = [];
                                        _promises.push(userInstance.loadAttributes(msg.content.destination, true, 'clean'));
                                        _promises.push(userInstance.loadAttributes(_refe, true, 'clean'));
                                    
                                    Promise.all(_promises).then( values => {
                                        console.log("Request by: "+values[1].name)
                                        populateDataRespAndSend(values[0], values[1]);
                                        populateDataRespAndSend(values[1], values[0]);
                                    });
                                }

                                break;
                                
                        }
                    }
                }
            }
        });


        ws.on('close', function() {
            if(_refe){
                // TODO: complete
                
                userAvailableList[_refe] = false;
                
                _refe = false;
            }
        });

        ws.on('error', function(e) {
            console.log("# Error on channel: bar");
        });
        
    });
};