let express = require("express");
let router = express.Router();

/* MongoDB Client */
const { MongoClient } = require("mongodb");
let ObjectId = require("mongodb").ObjectId;
const url =
  "mongodb+srv://20230087:TungPakSum87@fyp.mjak5tb.mongodb.net/";
const client = new MongoClient(url);
const db = client.db("FYP");
const auth = require("../middlewares/auth");

// Get messages
router.get("/get/:uid", auth, async function (req, res, next) {
  try {
    const { uid } = req.params;
    let user = req.user;
    delete user.iat;
    delete user.exp;

    const result = await db.collection("speakingChats").find({ uid }).toArray();

    if (result.length === 0) {
      return res.status(404).send("Unable to find the requested resource!");
    } else {
      return res.status(200).json({ conversations: result });
    }
  } catch (error) {
    console.error("Error retrieving conversation:", error);
    return res.status(500).json(error);
  }
});


// Delete Items
router.delete("/delete/:uid", auth, async function (req, res) {

  const { uid } = req.params;
  let user = req.user;
  delete user.iat;
  delete user.exp;

try{
    let result = await db.collection("speakingChats").deleteMany({ uid });
    
    if (result.deletedCount > 0) {
      return res.status(200).json({ message: "Chats deleted successfully" });
    } else {
      return res.status(404).json({ message: "No Chats found for deletion" });
    }
} catch (error) {
  console.error("Error deleting documents:", error);
  return res.status(500).json({ error: "An error occurred while deleting documents" });
}
});

// save message
router.post("/save", auth, async function (req, res) {
  
  let user = req.user;
  delete user.iat;
  delete user.exp;

  let message = req.body;
  try {
    const result = await db.collection("speakingChats").insertOne(message);
    return res.status(201).json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Error saving message' });
  }
});


module.exports = router;
