import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; // Import the cors middleware
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const port = 4000;
const app = express();
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'yourDatabaseName';

let db;

// Initialize MongoDB connection
MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch(error => console.error('Error connecting to MongoDB:', error));

// Use cors middleware to enable CORS with various options
app.use(cors());

// Middleware to parse JSON and URL encoded data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World, from express');
});

// Register new user
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword, date: new Date() };
    const collection = db.collection('users');
    const result = await collection.insertOne(newUser);
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

// Handle user login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const collection = db.collection('users');
    const user = await collection.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

// Add new user (example endpoint, might overlap with registration)
app.post('/addUser', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newDocument = { username, password: hashedPassword, date: new Date() };
    const collection = await db.collection('users');
    const result = await collection.insertOne(newDocument);
    console.log("Request body:", req.body);
    res.status(200).send(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

// Get all users
app.get('/getUser', async (req, res) => {
  try {
    const collection = await db.collection('users');
    const results = await collection.find({}).toArray();
    res.status(200).send(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

app.listen(port, () => {
  console.log('Server is listening at port:', port);
});
