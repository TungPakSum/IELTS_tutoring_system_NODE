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

// Delete User
router.delete("/delete/:id", auth, async function (req, res) {
    if (!ObjectId.isValid(req.params.id))
        return res.status(404).send("Unable to find the requested resource!");

    let result = await db
        .collection("users")
        .findOneAndDelete({ _id: new ObjectId(req.params.id) });
    if (!result.value)
        return res.status(404).send("Unable to find the requested resource!");
    return res.status(204).send();
});

// Get Passage by ID
router.get("/get/:id", auth, async function (req, res, next) {
    let user = req.user;
    delete user.iat;
    delete user.exp;

    if (!ObjectId.isValid(req.params.id))
        return res.status(404).send("Unable to find the requested resource!");

    let result = await db.collection("passages").findOne({ _id: new ObjectId(req.params.id) });
    if (!result)
        return res.status(404).send("Unable to find the requested resource!");

    return res.json({ passage: result });
});

//get questions by id
router.get("/getquestions/:id", auth, async function (req, res, next) {
    let user = req.user;
    delete user.iat;
    delete user.exp;
  
    if (!ObjectId.isValid(req.params.id))
      return res.status(404).send("Unable to find the requested resource!");
  
    try {
      let result = await db.collection("questions").find({ pid: req.params.id }).toArray();
  
      if (result.length === 0)
        return res.status(404).send("Unable to find the requested resource!");
  
      return res.json({ questions: result });
    } catch (error) {
      return res.status(500).send("Error retrieving questions: " + error.message);
    }
  });




//update passage 

router.put("/update/:id", auth, async function (req, res) {
    let result = {};
    if (!ObjectId.isValid(req.params.id))
        return res.status(404).send("Id is not is valid!");
    if (req.params.id) {
        result = await db.collection('passages').findOneAndReplace(
            { _id: new ObjectId(req.params.id) },
            req.body
        );
        return res.status(200).send("passage updated");
    }
    if (!result.value)
        return res.status(404).send("Unable to find the requested resource!");
});

//update questions

router.put("/updatequestion/:id", auth, async function (req, res) {
    if (!ObjectId.isValid(req.params.id))
      return res.status(404).send("Id is not valid!");
  
    try {
      const deleteResult = await db.collection("questions").deleteMany({ pid: req.params.id });

      console.log(deleteResult); // Debugging statement
      console.log(req.body);

      if (Array.isArray(req.body) && req.body.length > 0) {
        const insertResult = await db.collection("questions").insertMany(req.body.map(question => ({ ...question, pid: req.params.id })));
        return res.status(200).send("Questions updated");
      }
  
      return res.status(200).send("No questions to update");
    } catch (error) {
      console.log(error); // Debugging statement
      return res.status(500).send("Error updating questions: " + error.message);
    }
  });

// Delete User in the User Card
router.delete("/delete/:id", auth, async function (req, res) {
    if (!ObjectId.isValid(req.params.id))
        return res.status(404).send("Unable to find the requested resource!");

    let result = await db
        .collection("users")
        .findOneAndDelete({ _id: new ObjectId(req.params.id) });
    if (!result.value)
        return res.status(404).send("Unable to find the requested resource!");
    return res.status(204).send();
});

// Delete passage and questions in the passage Form
router.delete("/get/:id/confirm/delete", auth, async function (req, res) {
  try {
    const passageId = new ObjectId(req.params.id);

    let resultpassage = await db
      .collection("passages")
      .findOneAndDelete({ _id: passageId });

    if (resultpassage.deletedCount === 0) {
      return res.status(404).send("Unable to find the requested resource!");
    }

    let resultquestion = await db
      .collection("questions")
      .deleteMany({ pid: req.params.id });

    if (resultquestion.deletedCount === 0) {
      return res.status(404).send("Unable to find the requested resource!");
    }

    return res.status(204).send("Passage Deleted");
  } catch (error) {
    console.error("Error deleting passage:", error);
    return res.status(500).send("Internal server error");
  }
});





/* Passage Create */
router.post("/create", auth, async function (req, res, next) {
    let loggedUser = req.user;
    delete loggedUser.iat;
    delete loggedUser.exp;
  
    let passage = req.body;
    try {
      const result = await db.collection("passages").insertOne(passage);
      return res.status(201).json(result.insertedId); // Return the inserted passage ID
    } catch (error) {
      return res.status(500).json(error);
    }
  });

/* Questions Create */
router.post("/createquestion", auth, async function (req, res, next) {
    let loggedUser = req.user;
    delete loggedUser.iat;
    delete loggedUser.exp;
  
    let questions = req.body;
  
    try {
      const result = await db.collection("questions").insertMany(questions);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json(error);
    }
  });


// Get Passages in card
router.get("/get/:url", auth, async function (req, res) {
    console.log(req.query.page);
    let perPage = Math.max(req.query.perPage, 6) || 6;
    let results = await db
        .collection("users")
        .find(
            {},
            {
                limit: perPage,
                skip: perPage * (Math.max(req.query.page - 1, 0) || 0),
            }
        )
        .toArray();
    let pages = Math.ceil((await db.collection("users").count()) / perPage);
    return res.json({ items: results, pages: pages, perPage: perPage });
});





// Get 
router.get("/getall/perPage=:perPage/page=:page", auth, async function (req, res) {
  const perPage = parseInt(req.params.perPage) || 6;
  const page = parseInt(req.params.page) || 1;

  const results = await db
    .collection('passages')
    .find({})
    .limit(perPage)
    .skip((page - 1) * perPage)
    .toArray();

  

  const totalCount = await db.collection('passages').countDocuments();
  const totalPages = Math.ceil(totalCount / perPage);

  return res.json({ passages: results, totalPages: totalPages, currentPage: page });
});


module.exports = router;
