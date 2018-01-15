const handleMalformed = require('../models/socketHelper').throwSocketMalformedException;
const formatResponseOutput = require('../models/socketHelper').formatResponseOutput;
const ack = require('../models/socketHelper').ack;
var UserFactory = require('../models/user.js');

module.exports = function(wss){ 

    wss.on('connection', function(ws) {
        var currentUser = (new UserFactory());

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
                            case 'login':
                            
                                currentUser.connect(msg.content.id).then(
                                    (user) => {
                                        ws.send(JSON.stringify(formatResponseOutput(user)));
                                    },
                                    (err) => {
                                        ws.send(JSON.stringify(handleMalformed()));
                                    }
                                )
                                break;
                            default:
                                ws.send(JSON.stringify(handleMalformed()));
                                break;
                        }
                    }else{
                        ws.send(JSON.stringify(handleMalformed()));
                    }
                }else{
                    ws.send(JSON.stringify(handleMalformed()));
                }
            }
        });
        
        ws.on('close', function() {
            currentUser.disconnect();
            console.log("# Closed connection on channel: bar");
        });

        ws.on('error', function(e) {
            console.log("# Error on channel: bar");
        });
    });
};