const EventEmitter = require('events');
const myEmitter = new EventEmitter();

var Datastore = require('nedb');
var db = new Datastore({ 
            filename: process.env.STORAGE + process.env.DB_FILE,
            autoload: true 
        });

var keepKeys = function(obj, keys){
  var final = {};

  keys.forEach((key, index) => final[key] = obj[key]);

  return final;

}

var refreshContext = function(){
  db.update({}, { $set: { online: false, session: "" } }, { multi: true }, function (err, numReplaced) {
    console.log("Refreshed total of: "+numReplaced);
  });
}

module.exports = {
  database: db,
  db_methods: {
      refreshContext: refreshContext
    },
  events: myEmitter,
  keepKeys: keepKeys
}