import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './mongoC.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const port = 4000;
const app = express();

// Use cors middleware to enable CORS with various options
app.use(cors());

// Middleware to parse JSON and URL encoded data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let db;

connectDB().then(database => {
  db = database;
  // Start the server only after DB connection is established
  app.listen(port, () => {
    console.log("Server is listening at port:" + port);
  });
});

app.get('/', (req, res) => {
  res.send('Hello World, from express');
});

app.post('/addUser', async (req, res) => {
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

app.get('/getUser', async (req, res) => {
  try {
    let collection = await db.collection("users");
    let results = await collection.find({}).toArray();
    res.status(200).send(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    let collection = await db.collection("users");
    let user = await collection.findOne({ username });

    if (user && user.password === password) {
      res.status(200).send({ success: true, userId: user._id });
    } else {
      res.status(401).send({ success: false });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

app.post('/enable-mfa', async (req, res) => {
  const { userId } = req.body;

  const secret = speakeasy.generateSecret({ length: 20 });

  await db.collection('users').updateOne({ _id: userId }, { $set: { mfaSecret: secret.base32 } });

  const qrCodeUrl = speakeasy.otpauthURL({
    secret: secret.ascii,
    label: 'YourAppName',
    issuer: 'YourAppName',
    encoding: 'base32'
  });

  qrcode.toDataURL(qrCodeUrl, (err, dataUrl) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to generate QR code' });
    }
    res.json({ qrCodeUrl: dataUrl });
  });
});
