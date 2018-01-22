var requestTypes = {
    login: {
        type: "",
        user: ""
    }
}

module.exports = {
    getRequestType: function(type) {
        return Object.assign({}, requestTypes[type]);
    }
}