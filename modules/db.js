var db_config   = require('../config/db-config.js');
var mongoDB     = require('mongodb').MongoClient;

var connection_string = 'mongodb://127.0.0.1:27017/nodejs';
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = 'mongodb://' + process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

function connect(callback){
  mongoDB.connect(connection_string, function(err, db) {
    if(err) throw err;
    callback(db);
  });
}

function getAllDocuments(collection, callback) {
  mongoDB.connect(connection_string, function(err, db) {
    if(err) throw err;
    var allDocs = db.collection(collection).find().toArray(function(err, docs) {
      callback(docs);
      db.close();
    });
  });
}

exports.getAllDocuments = getAllDocuments;

exports.findDocs = function(collection, matchHash, callback) {
  connect(function(db){
    var cursor = db.collection(collection).find(matchHash);
    var ret = [];
    cursor.each(function(err, doc){
      if(doc != null)
        ret.push(doc);
      else
        callback(ret);
    });
  });
}

exports.addDoc = function(collection, doc, callback) {
  connect(function(db){
    var ret = db.collection(collection).insert(doc, function(err, result){
      if (callback)
        callback(result);
      db.close();
    });
  });
}

exports.updateOneDoc = function(collection, findJson, updateJson, callback) {
  connect(function(db){
    var ret = db.collection(collection).updateOne(findJson, updateJson, function(err, result) {
      if (callback)
        callback(result);
      db.close();
    })
  });
}

exports.removeOneDoc = function(collection, findJson, callback) {
  connect(function(db){
    var ret = db.collection(collection).deleteOne(findJson, function(err, result){
      if (callback)
        callback(result);
      db.close();
    });
  });
}

exports.addSysTrigger = function(trigger, callback) {
  mongoDB.connect(connection_string, function(err, db) {
    if(err) throw err;
    var allDocs = db.collection(db_config.system_triggers_table).insert(trigger, function(err, result){
      if (callback)
        callback(result);
      db.close();
    });
  });
};

exports.updateSysTrigger = function(trigger, callback) {
  mongoDB.connect(connection_string, function(err, db){
    if(err) throw err;
    db.collection(db_config.system_triggers_table).updateOne({"name" : trigger["name"]}, {
      $set: { "description": trigger["description"] }
    }, function(err, result) {
      if (callback)
        callback(results);
      db.close();
    });
  });
}

exports.getSysTriggers = function(callback) {
  getAllDocuments(db_config.system_triggers_table, callback);
};

exports.getApiTriggers = function(callback) {
  getAllDocuments(db_config.api_triggers_table, callback);
};
