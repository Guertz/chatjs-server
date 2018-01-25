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

module.exports = getError;