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

function getAllDocuments(collection, callback) {
  mongoDB.connect(connection_string, function(err, db) {
    if(err) throw err;
    var allDocs = db.collection(collection).find().toArray(function(err, docs) {
      callback(docs);
      db.close();
    });
  });
}

exports.addMod = function(mod, callback) {
  mongoDB.connect(connection_string, function(err, db) {
    if(err) throw err;
    var allDocs = db.collection(db_config.mods_table).insert(mod, function(err, result){
      if (callback)
        callback(result);
      db.close();
    });
  });
};

exports.addTrigger = function(trigger, callback) {
  mongoDB.connect(connection_string, function(err, db) {
    if(err) throw err;
    var allDocs = db.collection(db_config.triggers_table).insert(trigger, function(err, result){
      if (callback)
        callback(result);
      db.close();
    });
  });
};

exports.updateTrigger = function(trigger, callback) {
  mongoDB.connect(connection_string, function(err, db){
    if(err) throw err;
    db.collection(db_config.triggers_table).updateOne({"name" : trigger["name"]}, {
      $set: { "description": trigger["description"] }
    }, function(err, result) {
      if (callback)
        callback(results);
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

exports.getMods = function(callback) {
  getAllDocuments(db_config.mods_table, callback);
};

exports.getTriggers = function(callback) {
  getAllDocuments(db_config.triggers_table, callback);
};

exports.getSysTriggers = function(callback) {
  getAllDocuments(db_config.system_triggers_table, callback);
};

exports.getApiTriggers = function(callback) {
  getAllDocuments(db_config.api_triggers_table, callback);
};

exports.findMod = function(mod, callback) {
  mongoDB.connect(connection_string, function(err, db) {
    if(err) throw err;
    var allDocs = db.collection('mods').findOne({name: mod},function(err, docs){
      callback(docs);
      db.close();
    });
  });
};