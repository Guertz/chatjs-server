const events = require('../models/helper.js').events;
const handleMalformed = require('../models/socketHelper').throwSocketMalformedException;
const formatResponseOutput = require('../models/socketHelper').formatResponseOutput;
const ack = require('../models/socketHelper').ack;
var database  = require('../models/helper.js').database;

var userListenersLogin = {};
var userListenersLogout = {};

module.exports = function(wss){ 

    wss.on('connection', function(ws) {
        
        var _id = false;

        var eventLogin = function(user) {

            database.find({ $where: function() { return (this.online && this._id != _id); } }, function (err, docs) {

                ws.send(JSON.stringify(formatResponseOutput(docs)));
            });
        }
        
        var eventLogout = function(user) {
            database.find({ $where: function() { return (this.online && this._id != _id); } }, function (err, docs) {
                ws.send(JSON.stringify(formatResponseOutput(docs)));
            });
        }
        
        ws.on('message', function(data, flag){
            if(!flag.binary){
                var _localErrors = false;

                try{
                    var msg = JSON.parse(data); 
                }catch(err){
                    _localErrors = true;           
                }

                if(!_localErrors){
                    if(msg.type && msg.user){
                        switch(msg.type){
                            case 'listen':
                                _id = msg.user._id;

                                userListenersLogin[_id] = eventLogin;
                                userListenersLogout[_id] = eventLogout;
                                
                                events.addListener('user.login', userListenersLogin[_id]);
                                events.addListener('user.logout', userListenersLogout[_id]);
                                
                                eventLogin();
                                
                                break;
                                
                        }
                    }
                }
            }
        });


        ws.on('close', function() {
            if(_id){
                events.removeListener('user.login',  userListenersLogin[_id]);
                events.removeListener('user.logout', userListenersLogout[_id]);

                _id = false;
            }
        });

        ws.on('error', function(e) {
            console.log("# Error on channel: bar");
        });
        
    });
};