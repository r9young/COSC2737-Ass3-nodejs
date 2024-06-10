import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './mongoC.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { ObjectId } from 'mongodb';

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

app.post('/addUser', async (req, res) => {
  try {
    let collection = await db.collection('users');
    let newDocument = req.body;
    newDocument.date = new Date();
    let result = await collection.insertOne(newDocument);
    console.log('Request body:', req.body);
    res.status(200).send(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

app.get('/getUser', async (req, res) => {
  try {
    let collection = await db.collection('users');
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
    let collection = await db.collection('users');
    let user = await collection.findOne({ username });

    if (user && user.password === password) {
      const response = {
        success: true,
        userId: user._id.toString(),
        mfaSecret: user.mfaEnabled ? user.mfaSecret : null
      };
      res.status(200).send(response);
    } else {
      res.status(401).send({ success: false });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});



// Route to enable MFA
app.post('/enable-mfa', async (req, res) => {
  const { userId } = req.body;

  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }
    
    const objectId = new ObjectId(userId); // Convert userId to ObjectId

    // Generate a secret key
    const secret = speakeasy.generateSecret({ length: 20 });

    // Store the secret key in the database against the user
    await db.collection('users').updateOne({ _id: objectId }, { $set: { mfaSecret: secret.base32 } });

    // Generate a QR code for Google Authenticator
    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret.base32, // Ensure consistency in encoding, done
      label: `YourAppName:${userId}`,
      issuer: 'YourAppName',
      encoding: 'base32'
    });

    qrcode.toDataURL(otpAuthUrl, (err, dataUrl) => {
      if (err) {
        console.error('Error generating QR code:', err);
        return res.status(500).json({ error: 'Failed to generate QR code' });
      }
      res.json({ qrCodeUrl: dataUrl });
    });
  } catch (error) {
    console.error('Error in /enable-mfa endpoint:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log('Server is listening at port:' + port);
});
