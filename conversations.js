import express from 'express';
import { ObjectId } from 'mongodb';
import db from './mongoC.js';

const router = express.Router();

router.get('/conversations', async (req, res) => {
  const userId = req.user.id; // Assume the user ID is available from the authenticated session
  try {
    const collection = await db.collection('conversations');
    const conversations = await collection.find({ participants: userId }).toArray();
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
});

router.post('/conversations', async (req, res) => {
  const { participants } = req.body; // An array of user IDs
  try {
    const collection = await db.collection('conversations');
    const conversation = await collection.insertOne({ participants, messages: [], lastUpdated: new Date() });
    res.status(201).json({ success: true, conversationId: conversation.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create conversation' });
  }
});

router.post('/conversations/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { senderId, text } = req.body;
  try {
    const collection = await db.collection('conversations');
    const conversation = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { messages: { senderId, text, timestamp: new Date() } }, $set: { lastUpdated: new Date() } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

export default router;
