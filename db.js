var mongoDB     = require('mongodb').MongoClient;

var connection_string = 'mongodb://127.0.0.1:27017/nodejs';
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = 'mongodb://' + process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

function getTriggers(callback) {
  mongoDB.connect(connection_string, function(err, db) {
    if(err) throw err;
    var collection = db.collection('triggers').find().toArray(function(err, docs) {
      callback(docs);
      db.close();
    });
  });
}

exports.getTriggers = getTriggers;