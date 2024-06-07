import express from 'express';
import bodyParser from 'body-parser';


import db from "./mongoC.js";

const port = 4000;
const app = express();

app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
  
    next();
  });

// Parses the text as url encoded data
app.use(bodyParser.urlencoded({ extended: true }));
 
// Parses the text as json
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World, from express');
})

app.post('/addUser',async (req, res) => {
    let collection = await db.collection("users");
    let newDocument = req.body;
    newDocument.date = new Date();
    let result = await collection.insertOne(newDocument);
    // console.log("rreq"+req.body);
    console.log("Request body: ", req.body);
    res.send(result).status(204);
});

app.get('/getUsers', async (req, res) => {
    try {
        let collection = await db.collection("users");
        let results = await collection.find({}).toArray();
        res.status(200).send(results);
    } catch (e) {
        console.error(e);
        res.status(500).send('Error retrieving users');
    }
});

app.listen(port, function () {
    console.log("Server is listening at port:" + port);
});

// import express from 'express';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import db from "./mongoC.js";

// const port = 4000;
// const app = express();

// // Use the cors middleware
// app.use(cors());

// // Parses the text as url encoded data
// app.use(bodyParser.urlencoded({ extended: true }));

// // Parses the text as json
// app.use(bodyParser.json());

// app.get('/', (req, res) => {
//     res.send('Hello World, from express');
// });

// app.post('/addUser', async (req, res) => {
//     try {
//         let collection = await db.collection("users");
//         let newDocument = req.body;
//         newDocument.date = new Date();
//         let result = await collection.insertOne(newDocument);
//         console.log("Request body: ", req.body);
//         res.status(201).send(result);
//     } catch (e) {
//         console.error(e);
//         res.status(500).send('Error adding user');
//     }
// });

// app.get('/getUsers', async (req, res) => {
//     try {
//         let collection = await db.collection("users");
//         let results = await collection.find({}).toArray();
//         res.status(200).send(results);
//     } catch (e) {
//         console.error(e);
//         res.status(500).send('Error retrieving users');
//     }
// });

// app.listen(port, function () {
//     console.log("Server is listening at port:" + port);
// });
