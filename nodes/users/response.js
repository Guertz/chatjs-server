

var baseResponse = {
    baseList: {
        usersList: []
    }
};

module.exports = {
    List: function(docs = []) {
    
        var content = Object.assign({}, baseResponse["baseList"]);
            content.usersList = docs;
        

        return  content;
    }
}