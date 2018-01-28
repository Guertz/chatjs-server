// HARDCODED; FIX IT
var baseUser = {
    _id: "",
    name: "",
    image: ""
};

var baseResponse = {
    user: baseUser,
    online: false
}

// throw type not found exception
// TODO: user.toResponse();
module.exports = function(auth_status = false) {
    
    var content = Object.assign({}, baseResponse);
    
    if(auth_status) {
        content.user = auth_status;
        content.online = true;
    }

    return  content;
}