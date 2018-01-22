var crypto = require('crypto');
var database  = require('../helper/helper.js').database;
const events  = require('../helper/helper.js').events;
const generatePushID  = require('./chat/push-id.js');

function Chat(_ref = false){
    this._ref = _ref;

}

Chat.prototype.randomToken = function () {
    this._ref = crypto.randomBytes(8).toString('hex');
    return this._ref;
};


Chat.prototype.msgTok = function(){
    return generatePushID();
}

module.exports = Chat;
