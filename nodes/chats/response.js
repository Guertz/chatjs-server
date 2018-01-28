// HARDCODED; FIX IT
var baseUser = {
    _id: "",
    name: "",
    image: ""
};

var baseResponse = {
    create: {
        reference: "",
        destination: baseUser,
        from: baseUser,
        creator: ""
    }
}

module.exports = function(source, dest, chatInstance){

    var content = Object.assign({}, baseResponse["create"]);

        content.reference   = chatInstance._ref 
        content.destination = dest;
        content.from        = source;
        content.creator     = chatInstance.creator;
        

    console.log("Sending to: "+content.destination.name);

    return content;

}