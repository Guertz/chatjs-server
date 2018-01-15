var ack = function(){
    return "ack"
}

var throwSocketMalformedException = function(){
    return {
        error: 100,
        msg: "Malformed data"
    }
}

var formatResponseOutput = function(base){
    
    base["ok"] = true;
    base["error"] = 0;

    return base;
}
  
  module.exports = {
    throwSocketMalformedException: throwSocketMalformedException,
    formatResponseOutput: formatResponseOutput,
    ack: ack
  }