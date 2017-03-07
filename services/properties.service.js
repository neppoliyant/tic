var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var uuid = require('node-uuid');

var couchbase = require('couchbase');
var cluster = new couchbase.Cluster(config.connectionString);
var db = cluster.openBucket('Properties', 'star_2828');

var service = {};

service.GetAllFieldOfStudy = GetAllFieldOfStudy;
module.exports = service;

function GetAllFieldOfStudy() {
    var deferred = Q.defer();
    db.get('FieldOfStudy', function(err, results) {
      if (err) deferred.reject(err.name + ': ' + err.message);
      if (results && results.value) {
          deferred.resolve(results.value);
      } else {
          // authentication failed
          deferred.resolve();
      }
    });

    return deferred.promise;
}
