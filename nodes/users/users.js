var UserFactory = require('../../models/user.js');
var transport = require('../../helper/connection.js');

var getUserReqType = require('./request.js').getRequestType;
var getResponseContent = require('./response.js').getResponseContent;
var getResponseErrors = require('./response.js').getResponseErrors;

var userActionList = ['login', 'disconnect'];

module.exports = function(wss){ 

    wss.on('connection', function(ws) {
        
        var currentUser = (new UserFactory());

        ws.on('message', function(data, flag){

            var request = transport.request.parseRequest(data, flag, userActionList);

            // TODO: refactor create response on failure

            if(!request.errors.length){
                switch(request.content.type) {
                    case 'login':
                        var contentErrors = transport.request.validateContent(request.content, getUserReqType("login"));
                        if(!contentErrors.length){
                            currentUser.connect(request.content.user).then(
                                (user) =>{ 
                                    // user.toResponse method
                                    transport.response.send(transport.response.createResponse(getResponseContent("successLogin", user), false), ws);
                                  },
                                (err) => {
                                    transport.response.send(transport.response.createResponse(getResponseContent("successLogin", false), getResponseErrors("errorLogin")), ws);
                                }
                            );
                        } else {
                            transport.response.send(transport.response.createResponse(contentErrors), ws);
                        }

                    // case 'disconnect':
                    //     currentUser.disconnect();
                    //     ws.send(response.logout.success());
                    //   break;
                }
            } else {
                transport.response.send(transport.response.createResponse(request.errors), ws);
            }

        });
        
        ws.on('close', function() {
            currentUser.disconnect();
        });

        ws.on('error', function(e) {
            currentUser.disconnect();
        });
    });
};