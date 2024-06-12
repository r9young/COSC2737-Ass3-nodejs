import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './mongoC.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { ObjectId } from 'mongodb';
import conversationRoutes from './conversations.js'; // Ensure this path is correct
import { sendMail } from './mail.js';
import crypto from 'crypto';

const port = 4000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World, from express');
});

// Existing routes

app.use(express.json());


// Endpoint for password reset request
app.post('/password-reset-request', async (req, res) => {
  const { username } = req.body; // Use username instead of email

  try {
    const collection = await db.collection('users');
    const user = await collection.findOne({ username }); // Query using username

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Generate a reset token and expiration time
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 3600000; // Token valid for 1 hour

    // Save the token and expiration in the user's document
    await collection.updateOne(
      { _id: user._id },
      { $set: { resetToken, resetTokenExpires } }
    );

    const resetLink = `http://13.54.65.192:3000/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const text = `Hello, you requested a password reset. Please use the following link to reset your password: ${resetLink}`;
    const html = `<p>Hello,</p><p>You requested a password reset. Please use the following link to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`;

    // Send the email
    sendMail(user.username, subject, text, html); // Send email to user's email address
    res.status(200).send('Password reset email sent');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});



// Endpoint for handling password reset

// Endpoint for password reset request
app.post('/password-reset-request', async (req, res) => {
  const { username } = req.body; // Use username instead of email

  try {
    const collection = await db.collection('users');
    const user = await collection.findOne({ username }); // Query using username

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Generate a reset token and expiration time
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 3600000; // Token valid for 1 hour

    // Save the token and expiration in the user's document
    await collection.updateOne(
      { _id: user._id },
      { $set: { resetToken, resetTokenExpires } }
    );

    const resetLink = `http://13.54.65.192:3000/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const text = `Hello, you requested a password reset. Please use the following link to reset your password: ${resetLink}`;
    const html = `<p>Hello,</p><p>You requested a password reset. Please use the following link to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`;

    // Send the email
    sendMail(user.username, subject, text, html); // Send email to user's email address
    res.status(200).send('Password reset email sent');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

// Endpoint for handling password reset
app.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  try {
    const collection = await db.collection('users');
    const user = await collection.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).send('Invalid or expired token');
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    await collection.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword }, $unset: { resetToken: "", resetTokenExpires: "" } }
    );

    res.status(200).send('Password has been reset successfully');
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).send('An error occurred');
  }
});






//get user

app.post('/addUser', async (req, res) => {
  try {
    const collection = await db.collection('users');
    const newDocument = req.body;
    newDocument.date = new Date();
    const result = await collection.insertOne(newDocument);
    console.log('Request body:', req.body);

    // Check if email exists in the request body
    if (newDocument.email) {
      // Send welcome email
      sendMail(newDocument.email, 'Welcome!', 'Hello and welcome!', '<b>Hello and welcome!</b>');
    } else {
      console.error('Email address not provided');
    }

    res.status(200).send(result);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred');
    }
});

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

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const collection = await db.collection('users');
    const user = await collection.findOne({ username });

    if (user && user.password === password) {
      const response = {
        success: true,
        userId: user._id.toString(),
        mfaSecret: user.mfaSecret || null
      };
      console.log('User MFA status:', user.mfaSecret ? 'Enabled' : 'Disabled', 'MFA Secret:', user.mfaSecret);
      res.status(200).send(response);
    } else {
      res.status(401).send({ success: false });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('An error occurred');
  }
});

app.post('/api/verify-otp', async (req, res) => {
  const { otp, userId } = req.body;

  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    const collection = await db.collection('users');
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (user && user.mfaSecret) {
      console.log('Verifying OTP for user:', userId);
      console.log('Provided OTP:', otp);
      console.log('Stored MFA Secret:', user.mfaSecret);

      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: otp
      });

      if (verified) {
        console.log('OTP verified successfully for user:', userId);
        res.status(200).send({ success: true });
      } else {
        console.log('Invalid OTP for user:', userId);
        res.status(401).send({ success: false, message: 'Invalid OTP' });
      }
    } else {
      console.log('User not found or MFA not enabled for user:', userId);
      res.status(404).send({ success: false, message: 'User not found or MFA not enabled' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).send('An error occurred during OTP verification');
  }
});

app.post('/enable-mfa', async (req, res) => {
  const { userId } = req.body;

  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    const objectId = new ObjectId(userId);

    const secret = speakeasy.generateSecret({ length: 20 });

    await db.collection('users').updateOne({ _id: objectId }, { $set: { mfaSecret: secret.base32 } });

    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
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

// Use conversation routes
app.use('/api', conversationRoutes);

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { conversationId, senderId, text } = data;

    try {
      const collection = await db.collection('conversations');
      const newMessage = {
        _id: new ObjectId(),
        senderId: new ObjectId(senderId),
        text,
        timestamp: new Date()
      };

      // Verify the conversation exists
      const conversation = await collection.findOne({ _id: new ObjectId(conversationId) });
      if (!conversation) {
        console.error(`No conversation found with ID: ${conversationId}`);
        return;
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(conversationId) },
        { $push: { messages: newMessage }, $set: { lastUpdated: new Date() } }
      );

      if (result.modifiedCount === 0) {
        console.error(`Failed to update conversation with ID: ${conversationId}`);
        return;
      }

      io.to(conversationId).emit('newMessage', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log('Server is listening at port:' + port);
});
