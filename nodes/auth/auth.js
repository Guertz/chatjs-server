var UserFactory = require('../../models/user.js');
var transport = require('../../helper/connection.js');

var getRequests = require('./request.js');
var getResponse = require('./response.js');

var userActionList = {'login': false,  'logout': true};

module.exports = function(wss){ 

    wss.on('connection', function(ws) {
        
        var currentUser = (new UserFactory());

        ws.on('message', function(data, flag){

            // TODO: per message authenticate user
            // TODO: refactor create response on failure
            // TODO: return errors
            // TODO: load attribute in parseAuth load attributes only if he is logged (_session)
            // TODO: split action errors
            //       level 1: error parsing content (before reading type)
            //                c++ handled by wscustom.h
            //       level 2: error performing action
            //                c++ handled component/provider
            transport.request(data, flag, userActionList).then(
                (RequestHandler) => {
                    var content = RequestHandler.getRequest(getRequests());
                    if(!RequestHandler.hasErrors()){
                        switch(content.type) {
                            case 'login':
                                currentUser.connect(content.user).then(
                                    (user) => transport.response.send(
                                                transport.response.createSuccess(
                                                    getResponse(user),
                                                    "login"
                                                ), 
                                                ws),
                                        
                                    (err) => transport.response.send(
                                                transport.response.createSuccess(
                                                    getResponse(),
                                                    "login"
                                                ),
                                                ws)
                                    
                                );
                                break;
                            
                            // In this case auth is not needed (currentUser object is validated and kept on server)
                            // Use of events to notify
                            // The user wont be able to logout from other parts of the application
                            case 'logout':
                                currentUser.disconnect();
                                transport.response.send(
                                    transport.response.createSuccess(
                                        getResponse(),
                                        "logout"
                                    ),
                                    ws);

                              break;
                        }
                    } else {
                        var error = RequestHandler.getFirstError();
                            transport.response.send(transport.response.createError(error), ws);
                    }
                },
                (error) => {
                    transport.response.send(transport.response.createError(error), ws);
                }
            );

        });
                    
        ws.on('close', function() {
            currentUser.disconnect();
        });

        ws.on('error', function(e) {
            currentUser.disconnect();
        });
    });
};