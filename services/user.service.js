var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var uuid = require('node-uuid');

var couchbase = require('couchbase');
var cluster = new couchbase.Cluster(config.connectionString);
var db = cluster.openBucket('tic', 'star_2828');
var ViewQuery = couchbase.ViewQuery;

var service = {};

service.authenticate = authenticate;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;
service.search = _search;
service.addUser = _addUser;
service.getPendingUsers = _getPendingUsers;
service.acceptRequest = _acceptRequest;

module.exports = service;

function _acceptRequest(_id, _toId) {
  var deferred = Q.defer();

  getAndUpdateAcceptRequest(_id, _toId);
  getAndUpdateAcceptRequest(_toId, _id);

  deferred.resolve("Accepted the Request.");

  function getAndUpdateAcceptRequest(id, toId) {
    db.get(id, function (err, result) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (result.value && result.value.friendRequest) {
          var filteredData = _.remove(result.value.friendRequest, function(obj) {
              return obj._id == toId;
            });

            if (filteredData && filteredData.length == 1) {
              filteredData[0].status = "Accept";
              result.value.friendRequest.push(filteredData[0]);
            }

            db.upsert(id, result.value, function (err, result) {
              if (err) deferred.reject(err.name + ': ' + err.message);
            });
        } else {
            deferred.resolve("No Data found.");
        }
      });
  }

  return deferred.promise;
}

function _getPendingUsers(_id) {
  var deferred = Q.defer();

  db.get(_id, function (err, result) {
      if (err) deferred.reject(err.name + ': ' + err.message);

      if (result.value && result.value.friendRequest) {
        var filteredData = _.filter(result.value.friendRequest, function(obj) {
            return obj.status == "Pending Request";
          });
          deferred.resolve(filteredData);
      } else {
          deferred.resolve("No Data found.");
      }
    });
    return deferred.promise;
}

function _addUser(_id, _toId, data) {
    var deferred = Q.defer();

    db.get(_id, function (err, result) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (result.value) {
          var friendRequest = [];
            if (result.value.friendRequest) {
              friendRequest = result.value.friendRequest;
            }
            data.status = "Request Sent";
            friendRequest.push(data);
            result.value.friendRequest = friendRequest;

            db.upsert(
                _id,
                result.value,
                function (err, doc) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    udpdateToUser();
                });
        } else {
            deferred.reject("User Not Found");
        }
    });

    function udpdateToUser() {
      db.get(_toId, function (err, result) {
          if (err) deferred.reject(err.name + ': ' + err.message);

          if (result.value) {
            var friendRequest = [];
              if (result.value.friendRequest) {
                friendRequest = result.value.friendRequest;
              }
              data.status = "Pending Request";
              data._id = _id;
              friendRequest.push(data);
              result.value.friendRequest = friendRequest;

              db.upsert(
                  _toId,
                  result.value,
                  function (err, doc) {
                      if (err) deferred.reject(err.name + ': ' + err.message);

                      deferred.resolve("Request Sent");
                  });
          } else {
              deferred.reject("User Not Found");
          }
      });
    }
    return deferred.promise;
}

function _search(_name, _id) {
    var deferred = Q.defer();

    var options = {
      startKey: _name,
      inclusive_end: true
      };

    var query = ViewQuery.from('ticusername', 'by_username').custom(options).stale(ViewQuery.Update.BEFORE);

    db.query(query, function(err, results) {
      if (err) deferred.reject(err.name + ': ' + err.message);
      var endArr = [];
      if (results.length > 0) {
          for(var i=0;i<results.length;i++) {
            if (results[i].value._id != _id) {
              if (results[i].value.firstName.toLowerCase().indexOf(_name) != -1 || results[i].value.lastName.toLowerCase().indexOf(_name) != -1) {
                var addRequestStatus = _.find(results[i].value.friendRequest, function(request) {
                  if (request._id == _id) {
                    return request;
                  } else {
                    return false;
                  }
                });
                if (addRequestStatus && addRequestStatus._id) {
                  results[i].value.addRequest = addRequestStatus.status;
                }
                endArr.push(_.omit(results[i].value, ['hash', 'friendRequest']));
              }
            }
          }
          deferred.resolve(endArr);
      } else {
          deferred.resolve();
      }
    });

    return deferred.promise;
}

function authenticate(username, password) {
    var deferred = Q.defer();

    var query = ViewQuery.from('ticusername', 'by_username').key(username).stale(ViewQuery.Update.BEFORE);

    db.query(query, function(err, results) {
      if (err) deferred.reject(err.name + ': ' + err.message);
      if (results && results.length == 1 && bcrypt.compareSync(password, results[0].value.hash)) {
          // authentication successful
          deferred.resolve(jwt.sign({ sub: results[0].value._id }, config.secret));
      } else {
          // authentication failed
          deferred.resolve();
      }
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();
    db.get(_id, function (err, result) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (result.value) {
            // return user (without hashed password)
            deferred.resolve(_.omit(result.value, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function checkUserNameAlreadyExists(username, callback, deferred) {
  var query = ViewQuery.from('ticusername', 'by_username').key(username).stale(ViewQuery.Update.BEFORE);

  db.query(query, function(err, results) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    if (results.length > 0) {
      deferred.reject('Username "' + userParam.username + '" is already taken');
    } else {
      callback();
    }
  });
}

function create(userParam) {
    var deferred = Q.defer();

    checkUserNameAlreadyExists(userParam.username, createUser, deferred);

    function createUser() {
        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, 'password');

        user._id = uuid.v1();

        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);

        db.upsert(
            user._id,
            user,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();

    // validation
    db.get(_id, function (err, results) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        var user = results.value;
        if (user.username !== userParam.username) {
            checkUserNameAlreadyExists(userParam.username, updateUser, deferred);
        } else {
            updateUser();
        }
    });

    function updateUser() {
        // fields to update
        var set = {
            firstName: userParam.firstName,
            lastName: userParam.lastName,
            username: userParam.username,
            littleBitOfWork: userParam.littleBitOfWork,
            researchInstitue: userParam.researchInstitue,
            researchInterest: userParam.researchInterest,
            universitiesAttend: userParam.universitiesAttend,
            username: userParam.username,
            _id: userParam._id
        };

        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        db.upsert(
            _id,
            set,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.remove(
        _id,
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}
