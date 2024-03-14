const express = require("express");
const router = express.Router();

/* token */
let jwt = require("jsonwebtoken");
let auth = require("../middlewares/auth");
const { v4: uuidv4 } = require("uuid");

/* bcrypt */
const bcrypt = require("bcrypt");
const saltRounds = 10;

/* MongoDB Client */
const { MongoClient } = require("mongodb");
let ObjectId = require("mongodb").ObjectId;
const url =
    "mongodb+srv://20230087:TungPakSum87@fyp.mjak5tb.mongodb.net/";
const client = new MongoClient(url);
const db = client.db("FYP");

/* Score Create or Update */
router.post("/create", auth, async function (req, res, next) {
  let loggedUser = req.user;
  delete loggedUser.iat;
  delete loggedUser.exp;

  let scoreData = req.body;

  // Ensure uid and pid are provided in the scoreData
  if (!scoreData.uid || !scoreData.pid) {
    return res.status(400).json({ message: "Missing uid or pid in request." });
  }

  try {
    // Define the filter for the document we wish to find
    const filter = { uid: scoreData.uid, pid: scoreData.pid };
    
    // Define the update with the new scoreData
    const update = {
      $set: scoreData
    };

    // Set the options to upsert which creates a new document if no document matches the filter
    const options = { upsert: true };

    // Perform the find-and-replace operation
    const result = await db.collection("scores").findOneAndReplace(filter, scoreData, options);

    // If result.lastErrorObject.updatedExisting is true, it means a document was found and replaced
    // If it's false, it means a new document was created
    if (result.lastErrorObject.updatedExisting) {
      return res.status(200).json({ message: "Score updated successfully.", result: result });
    } else {
      return res.status(201).json({ message: "Score created successfully.", result: result });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/getByUserAndPassage/:uid/:pid", auth, async function (req, res, next) {
  let loggedUser = req.user;
  delete loggedUser.iat;
  delete loggedUser.exp;
  const { uid, pid } = req.params;

  console.log(req.params.uid + " " + req.params.pid)
  //let result = await db.collection("passages").findOne({ _id: new ObjectId(req.params.id) });
  try {
      const scores = await db.collection("scores").findOne({
          uid: req.params.uid,
          pid: req.params.pid
      });

      console.log(scores)

      if (!scores) {
          return res.status(404).send("No scores found for the given user and passage IDs");
      }

      return res.json({ score: scores });
  } catch (error) {
      console.log(error);
      return res.status(500).send("An error occurred while fetching the scores");
  }
});


module.exports = router;
