var UserFactory = require("../../models/user");
var getError    = require("./errors/errors");
var baseRequest = require("./format/format");

const RequestContext = function(_parsed, _auth, _request) {

    var _validated = false;
    var _contentErrors = [];

    var validate = function(format) {

        _validated = true;
        

        Object.keys(format).forEach((key, index) => {

            if(typeof _request[key] !== typeof format[key]){
                var error = getError("malformedContent");
                    error.flags = key;

                    _contentErrors.push(error);

                // break;
            }

        });
        
    };

    this.getRequest = function(format = false) {

        if(format && !_validated) {
            validate(format);
        }

        return Object.assign({}, _request);
    }

    this.hasErrors = function(){
        return !! (_contentErrors && _contentErrors.length > 0);
    }

    this.getErrors = function(){
        return _contentErrors.slice();
    }

    this.getFirstError = function() {
        return this.getErrors()[0];
    }

    this.getAuth = function() {
        return _auth;
    }
}


const RequestWrapper = function(requestSerialized, requestFlags, actionList = false, AUTH_REQUIRED = false) {

    var _parsed = undefined;

    var _auth = {
        key: false,
        user: {
            valid: false
        }
    }
    
    var _content = {};

    var resolveRequestSuccesfully = function() {
        return new RequestContext(_parsed, _auth, _content);
    }

    var matchesAction = function() {
        return (_parsed.content["type"] && 
                Array.isArray(actionList) &&
                actionList.includes(_parsed.content["type"]));
    }

    var parseAuth = function(){
        return new Promise((resolve, reject) => {
            
            if(AUTH_REQUIRED) {

                // Se auth richiesta, controlla
                var AUTH_KEY = _parsed["AUTH"];
                var User = (new UserFactory());

                if(AUTH_KEY && AUTH_KEY.length > 0) {
                    // Dati validi, controlla
                    return User.loadAttributes(AUTH_KEY, true, 'clean').then(
                        (user) => {
                                // Utente valido, completa OK
                                _auth.key = AUTH_KEY;
                                _auth.user = Object.assign(_auth.user, user);
                                resolve(true);
                            },
                                // Utente invalido, completa NO
                        (err) => reject(false)
                    );
                
                } else 
                    // Dati invalidi, completa NO
                    return reject(false);
            } else 
                // Se auth non richiesta, completa OK
                return resolve(true);

        });
    }

    return new Promise((resolve, reject) => {

        if(requestFlags.binary){
            return reject(getError("binary"));
        } else {
            try{

                _parsed = JSON.parse(requestSerialized); 
                
                return parseAuth().then(
                    (success) => {
                        var baseRequest = Object.assign({}, baseRequest);

                        var attributeError = Object.keys(baseRequest).forEach((key, index) => {
        
                            if(typeof baseRequest[key] !== typeof _parsed[key]){
                                var error = getError("malformedAttribute");
                                    error.flags = key;
        
                                    return error;
                            }
        
        
                        });

                        if(attributeError)
                            return reject(attributeError);
        
                        if(!matchesAction()) {
                            var error = getError("invalidAction");
                                error.flags = _parsed.content["type"];
                    
                                return reject(error);
                        }
        
                        _content = _parsed.content;

                        return resolve(resolveRequestSuccesfully());
                    },
                    (failure) => {
                        var error = getError("invalidAuth");
                            error.flags = "Credenziali errate";
                
                            return reject(error);
                    }
                );

            }catch(err){
                return reject(getError("malformed"));  
            }

        }

    });
      
}

module.exports = RequestWrapper;