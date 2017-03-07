var config = require('config.json');
var express = require('express');
var router = express.Router();
var journalService = require('services/journal.service');

// routes

router.post('/', createJournal);
router.put('/', updateJournal);
router.delete('/', deleteJournal);
router.get('/all', getAllJournal);
router.get('/search', getSearchJournal);
router.get('/getTopTen', getTopTen);

module.exports = router;

function createJournal(req, res) {
    journalService.create(req.body)
        .then(function (data) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateJournal(req, res) {
    journalService.update(req.body.userId, req.body)
        .then(function (data) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteJournal(req, res) {
    journalService.delete(req.query.userId, req.query.journalId)
        .then(function (data) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllJournal(req, res) {
    journalService.getByJournalId(req.query.id)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getSearchJournal(req, res) {
    if (req.query.id == '') {
        res.status(400).send('Search String should not be empty.');
    } else {
      journalService.getByName(req.query.id)
          .then(function (data) {
              res.send(data);
          })
          .catch(function (err) {
              res.status(400).send(err);
          });
    }
}

function getTopTen(req, res) {
  journalService.getTopTen(req.query.id)
      .then(function (data) {
          res.send(data);
      })
      .catch(function (err) {
          res.status(400).send(err);
      });
}
