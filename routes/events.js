let express = require("express");
let router = express.Router();

/* MongoDB Client */
const { MongoClient } = require("mongodb");
let ObjectId = require("mongodb").ObjectId;
const url =
  "mongodb+srv://20230087:TungPakSum87@fyp.mjak5tb.mongodb.net/";
const client = new MongoClient(url);
const db = client.db("cubcGroupD-DB");
const auth = require("../middlewares/auth");

// Get Event
router.get("/get/:id", auth, async function (req, res, next) {
  let user = req.user;
  delete user.iat;
  delete user.exp;

  if (!ObjectId.isValid(req.params.id))
    return res.status(404).send("Object Id is not valid");

  let result = await db.collection("events").findOne({
    _id: new ObjectId(req.params.id),
  });
  if (!result)
    return res.status(404).send("Unable to find the requested resource!");

  res.json({ items: result });
});

//Update Event
router.put("/update/:id", auth, async function (req, res) {
  let user = req.user;
  delete user.iat;
  delete user.exp;

  if (user.role === 'student')
  return res.status(403).send("Not authorized to create events!");

  let result = {};
  if (!ObjectId.isValid(req.params.id))
    return res.status(404).send("Id is not is valid!");
  if (req.params.id) {
    result = await db
      .collection("events")
      .findOneAndReplace({ _id: new ObjectId(req.params.id) }, req.body);
    return res.status(200).send("item updated");
  }
  if (!result.value)
    return res.status(404).send("Unable to find the requested resource!");
});

// Delete Items
router.delete("/delete/:id", auth, async function (req, res) {
  let user = req.user;
  delete user.iat;
  delete user.exp;

  if (user.role === 'stationManager')
  return res.status(403).send("Not authorized to create events!");

  if (!ObjectId.isValid(req.params.id))
    return res.status(404).send("Unable to find the requested resource!");
  let result = await db
    .collection("events")
    .findOneAndDelete({ _id: new ObjectId(req.params.id) });
  if (!result.value)
    return res.status(404).send("Unable to find the requested resource!");
  return res.status(204).send();
});

// Create Event
router.post("/create", auth, async function (req, res, next) {
  
  let user = req.user;
  delete user.iat;
  delete user.exp;

  if (user.role === 'student')
  return res.status(403).send("Not authorized to create events!");

  new ObjectId(req.body.id);
  let event = req.body;
  try {
    const result = await db.collection("events").insertOne(event);
    return res.status(201).json(result);
  } catch (e) {
    return res.status(500).json(e);
  }
});

// Get Events
router.get("/:url", auth, async function (req, res, next) {
  let user = req.user;
  delete user.iat;
  delete user.exp;

  let perPage = Math.max(req.query.perPage, 6) || 6;
  let results = await db
    .collection("events")
    .find(
      {},
      {
        limit: perPage,
        skip: perPage * (Math.max(req.query.page - 1, 0) || 0),
      }
    )
    .toArray();
  let pages = Math.ceil((await db.collection("events").count()) / perPage);
  return res.json({
    items: results,
    pages: pages,
    perPage: perPage,
    user: user,
  });
});
module.exports = router;
