var crypto = require('crypto');

function Chat(_ref = false, creator = ""){
    this._ref = _ref;
    this.creator = creator;
}

Chat.prototype.randomToken = function () {
    this._ref = crypto.randomBytes(8).toString('hex');
    return this._ref;
};

module.exports = Chat;
