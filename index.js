// "use strict"; // http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
require('dotenv').config();

var WebSocketServer = require('ws').Server;
var express   = require('express');
var db_h = require('./models/helper.js').db_methods;
var process = require('process');
    process.env.ROOT = process.cwd()+'/';

var app       = express();
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", process.env.APP_ALLOW_ORIGIN);
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
        next();
    })
    .use(express.static(process.env.ASSETS));

db_h.refreshContext();
var server = require('http').Server(app);

var wss = {};
    wss['users'] = new WebSocketServer({server: server, path: '/users'});
    require('./watcher/users.js')(wss['users']);

    wss['users-stream'] = new WebSocketServer({server: server, path: '/users-stream'});
    require('./watcher/users-stream.js')(wss['users-stream']);

    wss['chats-stream'] = new WebSocketServer({server: server, path: '/chats-stream'});
    require('./watcher/chats-stream.js')(wss['chats-stream'], WebSocketServer, server);

var UserFactory = require('./models/user.js');

server.listen(process.env.PORT);

app.get('/users/create/:userName', function (req, res) {
    (new UserFactory()).create(req.params.userName).then( user => {
        res.send("User created with id: "+user._id);
    });
    
});