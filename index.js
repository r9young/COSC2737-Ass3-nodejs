import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; // Import the cors middleware
import db from "./mongoC.js"; // Import the database connection

const port = 4000;
const app = express();

// Use cors middleware to enable CORS with various options
app.use(cors());

// Middleware to parse JSON and URL encoded data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World, from express');
});

app.post('/addUser', async (req, res) => { // Added leading slash
  try {
    let collection = await db.collection("users");
    let newDocument = req.body;
    newDocument.date = new Date();
    let result = await collection.insertOne(newDocument);
    console.log("Request body:", req.body);
    res.status(200).send(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

app.get('/getUser', async (req, res) => { // Added leading slash
  try {
    let collection = await db.collection("users");
    let results = await collection.find({}).toArray();
    res.status(200).send(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});


// Add the /api/login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    let collection = await db.collection("users");
    let user = await collection.findOne({ username });

    if (user && user.password === password) { // Simplified authentication
      res.status(200).send({ success: true });
    } else {
      res.status(401).send({ success: false });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});


app.listen(port, () => {
  console.log("Server is listening at port:" + port);
});


