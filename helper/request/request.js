// Headers
// Body
var baseRequest = {
    content: {},
};

var authRequest = {
    AUTH: "",
    content: {},
};

var errorTypes = {
    binary: {
            name: "binary",
            code: 201
        },
    malformed: {
            name: "malformed",
            code: 202
        },
    // header
    malformedAttribute : {
            name: "malformed-content",
            flags: "",
            code: 203
        },
    // body
    malformedContent: {
            name: "malformed-content",
            flags: "",
            code: 204
        },
    invalidAction: {
            name: "malformed-action",
            flags: "",
            code: 205
        },
    invalidAuth: {
            name: "invalid-auth",
            flags: "",
            code: 206
        }
};

var getError = function(type){
    return Object.assign({},errorTypes[type]);
}

var matchesAction = function(content, actionList) {
    return ( content["type"] && 
         Array.isArray(actionList) &&
         actionList.includes(content["type"]))
}

var request = {
    // break loop on first error
    // create object ... duplicated fields
    validateContent: function(requestContent, format) {

        var errors = [];

        Object.keys(format).forEach((key, index) => {

            if(typeof requestContent[key] !== typeof format[key]){
                var error = getError("malformedContent");
                    error.flags = key;

                    errors.push(error);
            }

        });
        
        return errors;
    },
    parseRequest: function(request, flag, actionList = false, isAuth = false){
    
        var requestData = undefined;
        var errors = [];
    
        if(flag.binary){
            errors.push(getError("binary"));
        } else {
            try{
                var parsed = JSON.parse(request); 
                
                var baseRequest = Object.assign({}, isAuth ? authRequest : baseRequest);

                Object.keys(baseRequest).forEach((key, index) => {

                    if(typeof baseRequest[key] !== typeof parsed[key]){
                        var error = getError("malformedAttribute");
                            error.flags = key;

                            errors.push(error);
                    }


                });

                if(!matchesAction(parsed.content, actionList)) {
                    var error = getError("invalidAction");
                        error.flags = parsed.content["type"];
            
                        errors.push(error);
                }

                // validate user
                //      set auth data
                //      return

                // if auth fails
                //      pushError
                //      return

                requestData = parsed.content;

            }catch(err){
                errors.push(getError("malformed"));     
            }
        }
    
        return {
            content:  requestData,
            errors: errors
        };
    },
    hasErrors: function(request){
        return !! (request.errors && request.errors.length > 0);
    },
    getUserInRequest: function() {

    }

}

module.exports = request;