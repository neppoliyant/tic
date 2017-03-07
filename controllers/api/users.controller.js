var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');
var journalService = require('services/journal.service');

// routes
router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.get('/current', getCurrentUser);
router.put('/:_id', updateUser);
router.delete('/:_id', deleteUser);
router.get('/search', getSearchJUsers);
router.put('/addrequest/:_id', addUser);
router.get('/pendingrequest', getPendingUsers);
router.put('/acceptrequest/:_toId', acceptRequest);

module.exports = router;

function acceptRequest(req, res) {
  userService.getPendingUsers(req.user.sub, req.query._toId)
      .then(function (data) {
          res.send(data);
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function getPendingUsers(req, res) {
  userService.getPendingUsers(req.user.sub)
      .then(function (data) {
          res.send(data);
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}

function addUser(req, res) {
    userService.addUser(req.params._id, req.query._toId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getSearchJUsers(req, res) {
    if (req.query.id == '') {
        res.status(400).send('Search String should not be empty.');
    } else {
      userService.search(req.query.id, req.user.sub)
          .then(function (data) {
              res.send(data);
          })
          .catch(function (err) {
              res.status(400).send(err);
          });
    }
}

function authenticateUser(req, res) {
    userService.authenticate(req.body.username, req.body.password)
        .then(function (token) {
            if (token) {
                // authentication successful
                res.send({ token: token });
            } else {
                // authentication failed
                res.status(401).send('Username or password is incorrect');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function registerUser(req, res) {
    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentUser(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only update own account
        return res.status(401).send('You can only update your own account');
    }

    userService.update(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only delete own account
        return res.status(401).send('You can only delete your own account');
    }

    userService.delete(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
