// HARDCODED; FIX IT
var baseUser = {
    _id: "",
    name: "",
    image: ""
};

var baseResponse = {
    baseLogin: {
        // corresponds to login in client enum
        action: 1,
        user: baseUser,
        online: false
    },
    baseLogout: {
        // correspons to logout in client enum
        action: 0,
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