var errorTypes = {
    errorLogin: {
        name: "error-login",
        flags: "Credenziali invalide",
        code: 300
    }
}

var successTypes = {
    successLogin: {
        user: "",
        online: false
    }
}

module.exports = {
    getResponseContent: function(type, data) {
        // throw type not found exception
        var content = Object.assign({}, successTypes[type]);
        
        if(data) {
            content.user = type._id;
            content.online = true;
        }

        return  content;
    },
    getResponseErrors: function(type) {

        // throw type not found exception
        var errors = [],
            error  = Object.assign({}, errorTypes[type]);

        return  errors;
    }
}