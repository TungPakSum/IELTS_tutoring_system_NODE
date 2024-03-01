var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let cors = require('cors')

var indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const eventsRouter = require('./routes/events');
const stationsRouter = require('./routes/stations');
const volunteersRouter = require('./routes/volunteers');
const bagsRouter = require('./routes/flagbags');
const chatsRouter = require('./routes/chats');
const speakingChatsRouter = require('./routes/speakingChats');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    cors({
        origin: 'http://localhost:8080',
        preflightContinue: true,
    }),
);

app.use('/', indexRouter);
app.use('/api/users/', usersRouter);
app.use('/api/events/', eventsRouter);
app.use('/api/stations/', stationsRouter);
app.use('/api/volunteers/', volunteersRouter);
app.use('/api/flagbags/', bagsRouter);
app.use('/api/chats/', chatsRouter);
app.use('/api/speakingChats/', speakingChatsRouter);

/* test case */
const { MongoClient } = require("mongodb");
// Replace the uri string with your connection string.
const url = "mongodb://groupd:vlQz3qq10nGdmFSb@ac-gm2iezg-shard-00-00.eyyijsu.mongodb.net:27017,ac-gm2iezg-shard-00-01.eyyijsu.mongodb.net:27017,ac-gm2iezg-shard-00-02.eyyijsu.mongodb.net:27017/?ssl=true&replicaSet=atlas-wzwa6h-shard-0&authSource=admin&retryWrites=true&w=majority";
const client = new MongoClient(url);
app.locals.db = client.db('cubcGroupD-DB');

app.locals.saltRounds = 10;

// You may also initialize the database with some data here
// (async () => {
//     const salt = bcrypt.genSaltSync(app.locals.saltRounds);
//     const hash = bcrypt.hashSync('123456', salt);
//     let result = await app.locals.db.collection("users").insertOne({
//         username: 'admin',
//         password: hash,
//         role:'admin'
//     })
// })();


module.exports = app;
