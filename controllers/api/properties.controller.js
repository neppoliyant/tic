var config = require('config.json');
var express = require('express');
var router = express.Router();
var propertyService = require('services/properties.service');

// routes

router.get('/GetAllFieldOfStudy', GetAllFieldOfStudy);

module.exports = router;

function GetAllFieldOfStudy(req, res) {
    propertyService.GetAllFieldOfStudy()
        .then(function (data) {
            if (data) {
                res.send(data);
            } else {
                res.status(400).send('Failed retrival of field of study');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
