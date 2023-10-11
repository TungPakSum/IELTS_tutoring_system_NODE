var express = require('express');
var router = express.Router();

/* MongoDB Client */
const { MongoClient } = require("mongodb");
let ObjectId = require("mongodb").ObjectId;
const url = "mongodb://groupd:vlQz3qq10nGdmFSb@ac-gm2iezg-shard-00-00.eyyijsu.mongodb.net:27017,ac-gm2iezg-shard-00-01.eyyijsu.mongodb.net:27017,ac-gm2iezg-shard-00-02.eyyijsu.mongodb.net:27017/?ssl=true&replicaSet=atlas-wzwa6h-shard-0&authSource=admin&retryWrites=true&w=majority";
const client = new MongoClient(url);
const db = client.db('cubcGroupD-DB');
const auth = require("../middlewares/auth");


// Create Volunteer
router.post('/create', auth, async function (req, res, next) {
  console.log(req.body);
  new ObjectId(req.body.id);
  let volunteers = req.body;
  try {
    const result = await db.collection('volunteers').insertOne(volunteers);
    return res.status(201).json(result.insertedId);
  } catch (e) {
    return res.status(500).json(e);
  }
});

// Get Volunteers list
router.get('/get/:id', auth, async function (req, res, next) {
  if (!ObjectId.isValid(req.params.id))
    return res.status(404).send("Object Id is not valid");

  let result = await db.collection('volunteers').findOne({
    _id: new ObjectId(req.params.id),
  });
  if (!result)
    return res.status(404).send("Unable to find the requested resource!");

  res.json({ items: result });
});

//Update Volunteer info
router.put("/update/:id", auth, async function (req, res) {
  let result = {};
  if (!ObjectId.isValid(req.params.id))
    return res.status(404).send("Id is not is valid!");
  if (req.params.id) {
    result = await db.collection('volunteers').findOneAndReplace(
      { _id: new ObjectId(req.params.id) },
      req.body
    );
    return res.status(200).send("item updated");
  }
  if (!result.value)
    return res.status(404).send("Unable to find the requested resource!");
});

//decrease flagbag count of volunteers
router.put('/decrease/:vid', auth, async function (req, res, next) {
  try {
    if (!ObjectId.isValid(req.params.vid)) {
      return res.status(404).send("Object Id is not valid");
    }

    const result = await db.collection('volunteers').findOneAndUpdate(
      { _id: new ObjectId(req.params.vid) },
      { $inc: { count: -1 } },
      { returnOriginal: false }
    );

    if (!result.value) {
      return res.status(404).send('Unable to find the requested resource!');
    }

    return res.json(result.value);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
});

//increase flagbag count of volunteers
router.put('/increase/:vid', auth, async function (req, res, next) {
  try {
    if (!ObjectId.isValid(req.params.vid)) {
      return res.status(404).send("Object Id is not valid");
    }

    const result = await db.collection('volunteers').findOneAndUpdate(
      { _id: new ObjectId(req.params.vid) },
      { $inc: { count: +1 } },
      { returnOriginal: false }
    );

    if (!result.value) {
      return res.status(404).send('Unable to find the requested resource!');
    }

    return res.json(result.value);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
});



// Delete Items
router.delete("/delete/:id", auth, async function (req, res) {
  if (!ObjectId.isValid(req.params.id))
    return res.status(404).send('Unable to find the requested resource!');

  let result = await db.collection('volunteers').findOneAndDelete({ _id: new ObjectId(req.params.id) })
  if (!result.value) return res.status(404).send('Unable to find the requested resource!');
  return res.status(204).send();
});

// Get Volunteer
router.get('/:url', auth, async function (req, res, next) {
  let user = req.user;
  delete user.iat;
  delete user.exp;

  let perPage = Math.max(req.query.perPage, 6) || 6;
  let results = await db.collection('volunteers').find({ "sid": `${req.query.sid}` }, {
    limit: perPage,
    skip: perPage * (Math.max(req.query.page - 1, 0) || 0)
  }).toArray();
  let pages = Math.ceil(await db.collection('volunteers').count() / perPage);
  return res.json({ items: results, pages: pages, perPage: perPage });
});

module.exports = router;