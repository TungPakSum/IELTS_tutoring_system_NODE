var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { titlçe: 'Express' });
});

/* MongoDB Client */
const { MongoClient } = require("mongodb");
let ObjectId = require("mongodb").ObjectId;
const url = "mongodb+srv://20230087:TungPakSum87@fyp.mjak5tb.mongodb.net/";
const client = new MongoClient(url);
const db = client.db('cubcGroupD-DB');
const auth = require("../middlewares/auth");

// Create Flagbag
//router.post('/create', async function (req, res, next) {
//    new ObjectId(req.body.id);
//let flagbag = req.body;
//    let flagbag;
//    if (req.body.name && req.body.flagStatus)
//    {
//      flagbag = { ...req.body };
//    } else if (req.body.name )
//    {
//      flagbag =
//      {
//        ...req.body,
//        flagStatus: {
//          name: '未發放',
//         status: 'not-issued'
//        }
//      };
//    } else {
//      return res.status(400).json({ error: 'Missing username' });
//   }

//    try {
//        const result = await db.collection('bags').insertOne(flagbag);
//        return res.status(201).json(result);
//    } catch (e) {
//        return res.status(500).json(e);
//    }
//});

//create
router.post('/create', async function (req, res, next) {
  const { name, flagStatus, count, eid, sid, vid } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }

  if (flagStatus) {
    // create a single record with specified flagStatus
    const flagbag = { name, flagStatus, eid, sid, vid };
    try {
      const result = await db.collection('bags').insertOne(flagbag);
      return res.status(201).json(result);
    } catch (e) {
      return res.status(500).json(e);
    }
  } else if (count) {
    // create multiple records with default flagStatus
    const createdRecords = [];
    for (let i = 1; i <= count; i++) {
      const flagbag = {
        name: `${name}-${i}`,
        flagStatus: {
          name: '未發放',
          status: 'not-issued'
        },
        eid,
        sid,
        vid
      };
      try {
        const result = await db.collection('bags').insertOne(flagbag);
        createdRecords.push(result);
      } catch (e) {
        return res.status(500).json(e);
      }
    }
    return res.status(201).json(createdRecords);
  } else {
    return res.status(400).json({ error: 'Missing flagStatus or count' });
  }
});

// Get Flagbag
router.get('/get/:id', async function (req, res, next) {
  if (!ObjectId.isValid(req.params.id))
    return res.status(404).send("Object Id is not valid");

  let result = await db.collection('bags').findOne({
    _id: new ObjectId(req.params.id),
  });
  if (!result)
    return res.status(404).send("Unable to find the requested resource!");

  res.json({ items: result });
});

//get from vid
router.get('/getFromVid/:vid', async function (req, res, next) {
  try {

    const result = await db.collection('bags').findOne({ vid: req.params.vid });
    console.log(result)
    if (!result) {
      return res.status(404).send('Bag not found');
    }
    res.json({ item: result });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error finding bag');
  }
});

//Delete Bags
router.delete("/delete/:id", async function (req, res) {
  if (!ObjectId.isValid(req.params.id))
    return res.status(404).send('Unable to find the requested resource!');

  let result = await db.collection('bags').findOneAndDelete({ _id: new ObjectId(req.params.id) })
  if (!result) {
    return res.status(404).send('Unable to find the requested resource!');
  }

  return res.status(204).send();
});


//Delete Bags with vid
router.delete("/deleteFromVid/:id", async function (req, res) {
  let result = await db.collection('bags').deleteMany({ vid: req.params.id })
  if (result.deletedCount === 0) {
    return res.status(404).send('Unable to find the requested resource!');
  }
  return res.status(204).send();
});

//Update Bags
router.put("/update/:id", async function (req, res) {
  console.log(req.params)
  let result = {};
  if (!ObjectId.isValid(req.params.id))
    return res.status(404).send("Id is not is valid!");
  result = await db.collection('bags').findOneAndReplace(
    {
      $or: [
        { _id: new ObjectId(req.params.id) },
        { vid: req.params.id }
      ]
    },
    req.body
  );
  if (!result) {
    return res.status(404).send("Bag not found");
  }
  return res.status(200).send("bag updated");

});

//Update Bags to received
router.put("/updateQr/:id", async function (req, res) {
  console.log(req.params)
  let result = {};
  const update = { $set: { "flagStatus": { status: "received", name: "已收取" } } };
  if (!ObjectId.isValid(req.params.id))
    return res.status(404).send("Id is not is valid!");
  result = await db.collection('bags').findOneAndUpdate(
    { _id: new ObjectId(req.params.id) },
    update
  );
  return res.status(200).send("bag recieved");

});

// Get Flagbags
router.get('/:url', auth, async function (req, res, next) {
  let user = req.user;
  delete user.iat;
  delete user.exp;

  let perPage = Math.max(req.query.perPage, 6) || 6;
  let results, resultsWithoutPages, pages;

  results = await db.collection('bags').find({ "vid": `${req.query.vid}` }, {
    limit: perPage,
    skip: perPage * (Math.max(req.query.page - 1, 0) || 0)
  }).toArray();
  pages = Math.ceil(await db.collection('bags').find({ "vid": `${req.query.vid}` }).count() / perPage);

  resultsWithoutPages = await db.collection('bags').find({ "vid": `${req.query.vid}` }, {}).toArray();
  return res.json({ items: results, itemsWithoutPages: resultsWithoutPages, pages: pages, perPage: perPage });
});


module.exports = router;