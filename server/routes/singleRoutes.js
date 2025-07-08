/* ===============================
Route for scoring single profile
================================ */

//Imports
const express = require('express');
const router = express.Router();
const fs = require('fs');
const { Partisan } = require('@dra2020/dra-analytics') //DRA analytics package

//MAIN ROUTE
//POST to /single
//Score single profile
router.post('/', (req, res) => {
    const profile = req.body //Store profile from request body
    console.log(profile)

    //Run partisan scorecard
    const scorecard = Partisan.makePartisanScorecard(profile.statewide, profile.byDistrict, true);

    //Delete unneeded metrics
    delete scorecard.experimental;
    delete scorecard.bias.gamma;
    delete scorecard.bias.gSym;

    //Respond with scorecard JSON
    res.json(scorecard);
}) 

//Export route
module.exports = router;