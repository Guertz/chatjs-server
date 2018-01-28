var baseResponse = {
    usersList: []
};

module.exports = function(docs = []) {

    var content = Object.assign({}, baseResponse);
        content.usersList = docs;
    

    return  content;
}
