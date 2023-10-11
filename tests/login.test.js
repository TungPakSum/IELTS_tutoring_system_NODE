// Import this plugin
const jestOpenAPI = require('jest-openapi').default;
const request = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const path = require('path')

// Load an OpenAPI file (YAML or JSON) into this plugin

jestOpenAPI(path.join(__dirname, '../openapi.yaml'));

// Write your test
describe('POST /api/login', () => {
    const adminUsername = 'testingAdmin';
    const adminPassword = '123456'
    let adminUserId = '';

    const { MongoClient } = require("mongodb");
    // Replace the uri string with your connection string.
    const uri =   "mongodb://groupd:vlQz3qq10nGdmFSb@ac-gm2iezg-shard-00-00.eyyijsu.mongodb.net:27017,ac-gm2iezg-shard-00-01.eyyijsu.mongodb.net:27017,ac-gm2iezg-shard-00-02.eyyijsu.mongodb.net:27017/?ssl=true&replicaSet=atlas-wzwa6h-shard-0&authSource=admin&retryWrites=true&w=majority";    ;
    const client = new MongoClient(uri);
    const db = client.db('cubcGroupD-DB');
    const saltRounds = 10;

    beforeAll(async () => {
        const salt = bcrypt.genSaltSync(saltRounds)
        let result = await db.collection('users').insertOne({
            username: adminUsername,
            password: bcrypt.hashSync(adminPassword, salt),
            role: 'admin'
        })
        adminUserId = result.insertedId
    });

    it('should satisfy OpenAPI spec', async () => {
        // Post username password json to login API
        const res = await request(app).post("/api/login").send({
            username: admin,
            password: admin
        });

        // Assert that the HTTP response satisfies the OpenAPI spec
        expect(res).toSatisfyApiSpec();
    });

    afterAll(async () => {
        await db.collection('users').deleteOne({_id: new ObjectId(adminUserId)})
    });
});