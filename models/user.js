var identicon = require('identicon');
var fs = require('fs');
var crypto = require('crypto');
var database  = require('../helper/helper.js').database;
const events  = require('../helper/helper.js').events;
const keepKeys  = require('../helper/helper.js').keepKeys;

function User(){

    // TODO: set as private
    this.attributes = {
        name : "",
        image: "",
        _session: "",
        online: false
    };
}

User.prototype.isValid = function(){
    return true;
};
User.prototype.loadAttributes = function(_id, force = false, _flags = false){
    var _ctx = this;

    return new Promise((resolve, reject) => {
        if(force)
            _ctx.attributes._session = false;

        if(!_ctx.attributes._session){
            return database.findOne({ _id: _id }, function (err, doc) {
                if(!err && doc){
                    _ctx.attributes = doc;
                    _ctx.attributes._session = _ctx.randomToken();
                    _ctx.attributes.online   = true;

                    if(_flags === 'clean'){

                        var finalObj = keepKeys(_ctx.attributes, [ 'name', 'image' ]);
                            finalObj['id'] = _id;

                        return resolve(finalObj);
                    }else  
                        return resolve(_ctx.attributes);
                }

                return reject(err);
            });
        }

        return resolve(_ctx.attributes);
    });
};

User.prototype.connect = function(id){

    var _ctx = this;

    return new Promise((resolve, reject) => {
        _ctx.attributes._id = id;
        _ctx.loadAttributes(id).then(
            (success) => {
                database.update({ _id: id}, _ctx.attributes, { }, function(err, numReplaced){
                    
                    if(err)
                        return reject("Failed insert"); // Error generator
        
                    events.emit('user.login', _ctx.attributes);
                    return resolve(_ctx.attributes);
                });
            },
            (errors) => {
                reject();
            }
        );

    });
};

User.prototype.disconnect    = function(id = false){
    var _ctx = this;
    return new Promise((resolve,reject)=>{

        // loadAttributes to check status
        _ctx.attributes._session = "";
        _ctx.attributes.online = false;

        return database.update({ _id: _ctx.attributes._id}, _ctx.attributes, { }, function(err, numReplaced){

            if(err)
                return reject("Update insert"); // Error generator
    
            events.emit('user.logout', _ctx.attributes);
            return resolve(_ctx);
        });
    
    })

}

User.prototype.loadFromToken = function(token){

    var _user = this;
    return new Promise((resolve, reject) => {
        return database.findOne({ _session: token }, function (err, doc) {
            if(!err){
                _user.attributes = doc;
                return resolve(_user);
            }

            return reject("Failed read");
        });
    });

    return _user;
};

User.prototype.create = function(name){
    var _user = this;

    return new Promise((resolve, reject) => {
        
        _user.attributes.name     = name;
        _user.attributes.image    = _user.randomImage();
        _user.attributes._session = _user.randomToken();

        if(!_user.isValid())
            return reject("Not valid data"); // Error generator

        // return to stop code
        return database.insert(_user.attributes, function(err, newDoc){

            if(err)
                return reject("Failed insert"); // Error generator

            _user.attributes = newDoc;
            events.emit('newUser');
            return resolve(_user.attributes);
        });
    })
};

User.prototype.toString = function() {
    console.log(` ID: ${this.attributes._id}, Name: ${this.attributes.name}`);
};

User.prototype.randomToken = function () {
    var token = crypto.randomBytes(8).toString('hex');

    return token;
};

User.prototype.randomImage = function(){

    const position = process.env.ASSETS + this.attributes.name+'.png';
    var buffer = identicon.generateSync({ id: this.attributes.name, size: 80 });
    fs.writeFileSync(position, buffer);

    return position.replace(process.env.ASSETS, 'http://'+process.env.HOST+':'+process.env.PORT+'/');
};

module.exports = User;
