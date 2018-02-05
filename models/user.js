var identicon = require('identicon');
var fs = require('fs');
var crypto = require('crypto');
var database  = require('../helper/helper.js').database;
const events  = require('../helper/helper.js').events;
const keepKeys  = require('../helper/helper.js').keepKeys;

const User = function(){

    var attributes = {
           _id: false,
          name: "",
         image: "",
        online: false
    };

    var getAttributes = function(keys = false) {

        var data = Object.assign({}, attributes);

        if(Array.isArray(keys) && keys.length > 0)
            data = keepKeys(attributes, keys);

        return data;

    }

    var getError = function(type = 'default') {
        var error = {
            default: {
                parent: "invalidAuth",
                name: "invalid-user",
                flags: "Ivalid credentials",
                code: 300
            },
            already: {
                parent: "invalidAuth",
                name: "invalid-user",
                flags: "Already logged in",
                code: 305
            }
        };

        return Object.assign({},error[type]);
    }

    var randomImage = function(){

        const position = process.env.ASSETS + attributes.name+'.png';
        var buffer = identicon.generateSync({ id: attributes.name, size: 80 });
        fs.writeFileSync(position, buffer);
    
        return position;
    }

    this.isValid = function() {
        return true;
    }

    this.loadAttributes = function(_id, force = false, _flags = false){

        return new Promise((resolve, reject) => {
            if(force || !attributes.online){
                return database.findOne({ _id: _id }, function (err, doc) {
                    if(!err && doc){
                        attributes          = doc;
                        // attributes.online   = true;
                        attributes.image    =
                            attributes.image.replace(
                                process.env.ASSETS, 
                                'http://'+process.env.HOST+':'+process.env.PORT+'/'
                            );

                        var _customAttrs = getAttributes();
                        
                        if(_flags == "clean")
                            _customAttrs = getAttributes([ '_id', 'name', 'image' ]);

                        return resolve(_customAttrs);
                    }
    
                    return reject(getError());
                });
            }
    
            return resolve(getAttributes());
        });
    }

    this.connect = function(id){

        return new Promise((resolve, reject) => {
            attributes._id = id;
            this.loadAttributes(id, true).then(
                (SESSION) => {
                    if(SESSION.online)
                        return reject(getError('already'));

                    SESSION.online = true;
                    attributes.online = true,

                    database.update({ _id: id}, SESSION, { }, function(err, numReplaced){
                        
                        if(err){
                            var error = getError();
                                error.flags = "Errore anomalo database update (Login)";

                            return reject(error);
                        }

                        events.emit('user.login', getAttributes());
                        return resolve(getAttributes());
                    });
                },
                (error) => {
                    return reject(error);
                }
            );
    
        });
    }

    this.disconnect    = function(id = false){
        return new Promise((resolve,reject) => {
    
            if(id)
                attributes._id = id;

            if(attributes._id) {
                attributes.online = false;
        
                return database.update({ _id: attributes._id}, attributes, { }, function(err, numReplaced){
        
                    if(err){
                        var error = getError();
                            error.flags = "Errore anomalo database update (Disconnect)";

                        return reject(error);
                    }
            
                    events.emit('user.logout', getAttributes());
                    return resolve(getAttributes());
                });
            }
        
        })
    }

    this.create = function(name){

        return new Promise((resolve, reject) => {
            
            attributes.name     = name;
            attributes.image    = randomImage();
    
            if(!this.isValid())
                return reject("Not valid data"); // Error generator
    
            return database.insert(getAttributes(['name', 'image', 'online']), function(err, newDoc){
    
                if(err)
                    return reject("Failed insert"); // Error generator

                return resolve(newDoc);
            });
        })
    }

    this.toString = function() {
        // console.log(` ID: ${attributes._id}, Name: ${attributes.name}`);
    }

}


module.exports = User;
