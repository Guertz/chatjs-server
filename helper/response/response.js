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
    createResponse: function(content = false, errors = false){
        var response = Object.assign({}, baseResponse);
            response.content = content;

        if(Array.isArray(errors) && errors.lenght > 0){
            var error = errors[0];

                response.status = error.code;
                response.error = error.name + ":" + error.flags;
                response.ok = false;
        }

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