// HARDCODED; FIX IT
var baseUser = {
    _id: "",
    name: "",
    image: ""
};

var baseResponse = {
    baseLogin: {
        user: baseUser,
        online: false
    },
    baseLogout: {
        user: baseUser,
        online: false
    }
}

// throw type not found exception
// TODO: user.toResponse();
module.exports = {
    Login: function(auth_status) {
    
        var content = Object.assign({}, baseResponse["baseLogin"]);
        
        if(auth_status) {
            content.user = auth_status;
            content.online = true;
        }

        return  content;
    },
    Logout: function(){

        var content = Object.assign({}, baseResponse["baseLogout"]);

        return  content;
    }
}