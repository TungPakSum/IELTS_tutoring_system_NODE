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

// Get User by ID
router.get("/get/:id", auth, async function (req, res, next) {
    let user = req.user;
    delete user.iat;
    delete user.exp;

    if (!ObjectId.isValid(req.params.id))
        return res.status(404).send("Unable to find the requested resource!");

    let result = await db.collection("users").findOne({ _id: new ObjectId(req.params.id) });
    if (!result)
        return res.status(404).send("Unable to find the requested resource!");

    return res.json({ items: result });
});

// Get User by Role
router.get('/get/role/:role', auth, async function (req, res, next) {
    let user = req.user;
    delete user.iat;
    delete user.exp;

    if (user.role === 'student')
        return res.status(403).send("Not allowed to access!");

    console.log(req.params.role);
    let result = await db.collection("users").find({ role: req.params.role }).toArray();
    if (!result) return res.status(404).send('Unable to find the requested resource!');

    return res.json({ items: result })

});

// Update Users
// router.put("/update/:id", async function (req, res) {
//   if (!ObjectId.isValid(req.params.id))
//     return res.status(404).send("Unable to find the requested resource!");

//   req.body.username = parseInt(req.body.username);

//   let result = await db
//     .collection("users")
//     .findOneAndReplace({ _id: new ObjectId(req.params.id) }, req.body);

//   if (!result.value)
//     return res.status(404).send("Unable to find the requested resource!");

//   res.send("Users updated.");
// });

router.put("/update/:id", auth, async function (req, res) {
    let result = {};
    if (!ObjectId.isValid(req.params.id))
        return res.status(404).send("Id is not is valid!");
    if (req.params.id) {
        result = await db.collection('users').findOneAndReplace(
            { _id: new ObjectId(req.params.id) },
            req.body
        );
        return res.status(200).send("item updated");
    }
    if (!result.value)
        return res.status(404).send("Unable to find the requested resource!");
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

// Delete User in the User Form
router.delete("/get/:id/confirm/delete", auth, async function (req, res) {
    //console.log(req.params.id);
    try {
        if (!ObjectId.isValid(req.params.id))
            return res.status(404).send("Unable to find the requested resource!");

        let result = await db
            .collection("users")
            .findOneAndDelete({ _id: new ObjectId(req.params.id) });
        if (!result.value)
            return res.status(404).send("Unable to find the requested resource!");
        return res.status(204).send("User Deleted");
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).send("Internal server error");
    }

});

/* User Login */
router.post("/login", async function (req, res, next) {
    let user = req.body;
    try {
        const result = await db.collection("users").findOne({
            username: user.username,
        });
        if (result) {
            const match = bcrypt.compareSync(user.password, result.password);
            if (match) {
                delete result.password;
                const user = {};
                const token = jwt.sign(
                    {
                        user_id: req.body.email,
                        username: result.username,
                        role: result.role,
                    },
                    "process.env.TOKEN_KEY",
                    {
                        expiresIn: "1h",
                    }
                );
                user.token = token;
                return res.status(200).json(user);
            } else
                return res.status(401).json({ message: "Incorrect password" });
        } else
            return res.status(401).json({ message: "User not found" });
    } catch (error) {
        return res.status(500).json(error);
    }
});

/* Check user token */
router.get("/check", auth, async function (req, res, next) {
    let user = req.user;
    delete user.iat;
    delete user.exp;
    return res.status(200).json(user);
})

/* User Create */
router.post("/create", auth, async function (req, res, next) {

    let loggedUser = req.user;
    delete loggedUser.iat;
    delete loggedUser.exp;

    if (loggedUser.role === 'student')
        return res.status(403).send("Not allowed to create users!");

    let user = req.body;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(user.password, salt);
    try {
        const result = await db.collection("users").insertOne({
            username: user.username,
            password: hash,
            email: user.email,
            role: user.role,
        });
        return res.status(201).json(result);
    } catch (e) {
        return res.status(500).json(e);
    }
});

// router.post('/create', async function (req, res, next) {
//     console.log(req.body);
//     new ObjectId(req.body.id);
//     let users = req.body;
//     try {
//         const result = await db.collection('users').insertOne(users);
//         return res.status(201).json(result);
//     } catch (e) {
//         return res.status(500).json(e);
//     }
// });

// Get Users
router.get("/:url", auth, async function (req, res) {
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

module.exports = router;
