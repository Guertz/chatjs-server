var baseResponse = {
    status: 0,
    ok: true,
    content: {},
    error: ""
};

var errorTypes = {
    channelClose: {
        name: "channel-closed",
        flags: "",
        code: -1
    }
}

var getError = function(type){
    return Object.assign({},errorTypes[type]);
}

var response = {
    createSuccess: function(content, type = ""){
        var response = Object.assign({}, baseResponse);
            response.content = content;
            // HARDCODED; optimize
            response.content["type"] = type;

        return response;
    },
    createError: function(error, action = "", content = {}) {
        var response = Object.assign({}, baseResponse);
            response.content = content;

        // HARDCODED; optimize
        response.content["type"] = type;
        response.status = error.code;
        response.error = error.name + ":" + error.flags;
        response.ok = false;

        return response;
    },
    send: function(response, socket){
        var errors = [];

        try{
            
            socket.send(JSON.stringify(response));

        }catch(err){

            console.log(" ## Detected error: "+err);

            // Do a detailed check
            var error = getError("channelClose");
                error.flags = err;

            errors.push(error);
        }

        return errors;
    }
}

module.exports = response;