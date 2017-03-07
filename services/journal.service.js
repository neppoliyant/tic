var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var uuid = require('node-uuid');
var couchbase = require('couchbase');
var cluster = new couchbase.Cluster(config.connectionString);
var db = cluster.openBucket('Journal', 'star_2828');
var OpenTok = require('opentok');
opentok = new OpenTok(config.openTok.apiKey, config.openTok.apiSecret);
var ViewQuery = couchbase.ViewQuery;

var service = {};

service.getAll = getAll;
service.getByJournalId = getByJournalId;
service.create = create;
service.update = update;
service.delete = _delete;
service.getByName = getByName;
service.getTopTen = getTopTen;

module.exports = service;

function getTopTen(_id) {
  var deferred = Q.defer();

  var options = {
    startKey: '',
    inclusive_end: true
    };

  var query = ViewQuery.from('journalSearch', 'by_journalName').custom(options).stale(ViewQuery.Update.AFTER);

  db.query(query, function(err, results) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    var endArr = [];
    if (results.length > 0) {
        for(var i=0;i<results.length;i++) {
            endArr.push(results[i].value);
            if (endArr.length == 10) {
              break;
            }
          }
        deferred.resolve(endArr);
    } else {
        deferred.resolve();
    }
  });

  return deferred.promise;
}

function getByName(_name) {
  var deferred = Q.defer();

  var options = {
    startKey: _name,
    inclusive_end: true
    };

  var query = ViewQuery.from('journalSearch', 'by_journalName').custom(options).stale(ViewQuery.Update.AFTER);

  db.query(query, function(err, results) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    var endArr = [];
    if (results.length > 0) {
        for(var i=0;i<results.length;i++) {
          if (results[i].value.journalName.toLowerCase().indexOf(_name) != -1) {
            endArr.push(results[i].value);
          }
        }
        deferred.resolve(endArr);
    } else {
        deferred.resolve();
    }
  });

  return deferred.promise;
}

function getAll(_id) {
    var deferred = Q.defer();

    db.get(_id, function (err, result) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (result.value) {
            // return user (without hashed password)
            deferred.resolve(result.value);
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getByJournalId(_id) {
    var deferred = Q.defer();
    db.get(_id, function (err, result) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (result && result.value) {
            // return user (without hashed password)
            deferred.resolve(result.value);
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function checkUserNameAlreadyExists(username, callback, deferred) {
  var query = ViewQuery.from('ticusername', 'by_username').key(username).stale(ViewQuery.Update.AFTER);

  db.query(query, function(err, results) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    if (results.length > 0) {
      deferred.reject('Username "' + userParam.username + '" is already taken');
    } else {
      callback();
    }
  });
}

function create(data) {
    var deferred = Q.defer();

    db.get(data.userId, function (err, results) {
        var arrData = [];
        data._id = uuid.v1();
        if (err) {
          if (err.message.indexOf('The key does not exist on the server') != -1) {
            opentok.createSession({mediaMode:"routed"}, function(err, session) {
              if (err) deferred.reject(err.name + ': ' + err.message);

              data.sessionId = session.sessionId;

              data.token = session.generateToken({
                role :       'moderator',
                expireTime : (new Date().getTime() / 1000)+(7 * 24 * 60 * 60), // in one week
                data :       'name=' + data.firstName
              });
              arrData.push(_.omit(data, 'userId'));
              createJournal(arrData, data.userId);
            });
          } else {
              deferred.reject(err.name + ': ' + err.message);
          }
        }

        if (results && results.value) {
          arrData = results.value;
          //Check jorunal already exist
          for (var i = 0; i < arrData.length; i++) {
              var post = arrData[i];
              if (post.journalName.indexOf(data.journalName) != -1) {
                deferred.reject('Journal Name: ' + data.journalName + ' already exists.');
                return;
              }
          }

          opentok.createSession({mediaMode:"routed"}, function(err, session) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            data.sessionId = session.sessionId;

            data.token = session.generateToken({
              role :       'moderator',
              expireTime : (new Date().getTime() / 1000)+(7 * 24 * 60 * 60), // in one week
              data :       'name=' + data.firstName
            });
            arrData.push(_.omit(data, 'userId'));
            createJournal(arrData, data.userId);
          });
        }
    });

    function createJournal(arrData, userId) {
      db.upsert(
          userId,
          arrData,
          function (err, doc) {
              if (err) deferred.reject(err.name + ': ' + err.message);

              deferred.resolve();
          });
    }
    return deferred.promise;
}

function update(_id, data) {
    var deferred = Q.defer();

    // validation
    db.get(_id, function (err, results) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        var arrData = results.value;
        //Check jorunal already exist
        for (var i = 0; i < arrData.length; i++) {
            var post = arrData[i];
            if (post._id.indexOf(data._id) != -1) {
              arrData[i] = _.omit(data, 'userId');
              break;
            }
        }

        updateJournal(arrData, _id);
    });

    function updateJournal(arrData, userId) {

      db.upsert(
          userId,
          arrData,
          function (err, doc) {
              if (err) deferred.reject(err.name + ': ' + err.message);

              deferred.resolve();
          });
    }

    return deferred.promise;
}

function _delete(userId, _id) {
    var deferred = Q.defer();

    // validation
    db.get(userId, function (err, results) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        var arrData = results.value;
        var arrNewData = [];
        //Check jorunal already exist
        for (var i = 0; i < arrData.length; i++) {
            var post = arrData[i];
            if (post._id.indexOf(_id) != -1) {
              console.log("Deleted");
            } else {
              arrNewData.push(post);
            }
        }

        updateJournal(arrNewData, userId);
    });

    function updateJournal(arrData, userId) {

      db.upsert(
          userId,
          arrData,
          function (err, doc) {
              if (err) deferred.reject(err.name + ': ' + err.message);

              deferred.resolve();
          });
    }

    return deferred.promise;
}
