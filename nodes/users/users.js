const events = require('../../helper/helper.js').events;
var database  = require('../../helper/helper.js').database;
var transport = require('../../helper/connection.js');

var getRequests = require('./request.js');
var getResponse = require('./response.js');

const userActionList = { 'open': true, 'close': false};

var userListenersLogin = {};
var userListenersLogout = {};

module.exports = function(wss){ 

    wss.on('connection', function(ws) {
        
        var _id = false;

        var _ubind = function(){
            if(_id) {
                events.removeListener('user.login',  userListenersLogin[_id]);
                events.removeListener('user.logout', userListenersLogout[_id]);

                _id = false;
            }
        }

        var eventLogin = function(user) {

            database.find({ $where: function() { return (this.online && this._id != _id); } }, function (err, docs) {

                if(!docs)
                    docs = [];

                console.log("Sending after event login");

                transport.response.send(
                    transport.response.createSuccess(
                        getResponse(docs), 
                        "open"), 
                    ws);

            });
        }
        
        var eventLogout = function(user) {
            database.find({ $where: function() { return (this.online && this._id != _id); } }, function (err, docs) {
                
                if(!docs)
                    docs = [];

                console.log("Sending after event logout");
                
                transport.response.send(
                    transport.response.createSuccess(
                        getResponse(docs), 
                        "open"), 
                    ws);
            });
        }
        
        ws.on('message', function(data, flag) {

            transport.request(data, flag, userActionList).then(
                (RequestHandler) => {
                    var content = RequestHandler.getRequest(getRequests());
                    if(!RequestHandler.hasErrors()){

                        switch(content.type) {
                            case 'open':

                                _id = RequestHandler.getAuth().key;

                                console.log("Watching for: #"+_id);
                                userListenersLogin[_id] = eventLogin;
                                userListenersLogout[_id] = eventLogout;
                                
                                events.addListener('user.login', userListenersLogin[_id]);
                                events.addListener('user.logout', userListenersLogout[_id]);
                                
                                eventLogin();

                                break;
                            case 'close':
                                _ubind();
                                transport.response.send(
                                    transport.response.createSuccess(
                                        getResponse(), 
                                        "close"), 
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
            _ubind();
        });

        ws.on('error', function(e) {
            _ubind();
        });
        
    });
}; 