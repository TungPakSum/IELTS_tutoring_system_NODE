var express = require('express');
var router = express.Router();


/* MongoDB Client */
const { MongoClient } = require("mongodb");
let ObjectId = require("mongodb").ObjectId;
const url = "mongodb://groupd:vlQz3qq10nGdmFSb@ac-gm2iezg-shard-00-00.eyyijsu.mongodb.net:27017,ac-gm2iezg-shard-00-01.eyyijsu.mongodb.net:27017,ac-gm2iezg-shard-00-02.eyyijsu.mongodb.net:27017/?ssl=true&replicaSet=atlas-wzwa6h-shard-0&authSource=admin&retryWrites=true&w=majority";
const client = new MongoClient(url);
const db = client.db('cubcGroupD-DB');
const auth = require("../middlewares/auth");



/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

// Create Station
router.post('/create', auth, async function (req, res, next) {
    new ObjectId(req.body.id);
    let station = req.body;
    try {
        const result = await db.collection('stations').insertOne(station);
        return res.status(201).json(result);
    } catch (e) {
        return res.status(500).json(e);
    }
});


// Get Station
router.get('/get/:id', auth, async function (req, res, next) {
    let user = req.user;
    delete user.iat;
    delete user.exp;
    
    if (!ObjectId.isValid(req.params.id))
        return res.status(404).send("Object Id is not valid");

    let result = await db.collection('stations').findOne({
        _id: new ObjectId(req.params.id),
    });
    if (!result)
        return res.status(404).send("Unable to find the requested resource!");

    res.json({ items: result });
});

//Update Station
router.put("/update/:id", auth, async function (req, res) {
    console.log(req.params)
    let result = {};
    if (!ObjectId.isValid(req.params.id))
        return res.status(404).send("Id is not is valid!");
    result = await db.collection('stations').findOneAndReplace(
        { _id: new ObjectId(req.params.id) },
        req.body
    );
    return res.status(200).send("station updated");

});

// Delete Station
router.delete("/delete/:id", auth, async function (req, res) {
    if (!ObjectId.isValid(req.params.id))
        return res.status(404).send('Unable to find the requested resource!');

    let result = await db.collection('stations').findOneAndDelete({ _id: new ObjectId(req.params.id) })
    if (!result.value) return res.status(404).send('Unable to find the requested resource!');
    return res.status(204).send();
});

//get ic
router.get("/ic", auth, async function (req, res) {
    let result = await db.collection('users').find({ role: "stationsManager" }).toArray();
    if (!result) {
        return res.status(404).send("Unable to find the requested resource!");
    }
    if (result.length === 0) {
        return res.status(404).send("No users found.");
    }
    res.json({ user: result });
});

// Get Stations
router.get('/:url', auth, async function (req, res, next) {
    let user = req.user;
    delete user.iat;
    delete user.exp;

    let perPage = Math.max(req.query.perPage, 6) || 6;
    let results, resultsWithoutPages, pages;

    results = await db.collection('stations').find({ "eid": `${req.query.eid}` }, {
        limit: perPage,
        skip: perPage * (Math.max(req.query.page - 1, 0) || 0)
    }).toArray();
    pages = Math.ceil(await db.collection('stations').count() / perPage);

    resultsWithoutPages = await db.collection('stations').find({ "eid": `${req.query.eid}` }, {}).toArray();
    return res.json({ items: results, itemsWithoutPages: resultsWithoutPages, pages: pages, perPage: perPage });
});


module.exports = router;