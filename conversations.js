import express from 'express';
import { ObjectId } from 'mongodb';
import db from './mongoC.js';

const router = express.Router();

router.get('/conversations', async (req, res) => {
  const userId = req.user?.id; // Assume the user ID is available from the authenticated session
  console.log(`Fetching conversations for user: ${userId}`);
  try {
    const collection = await db.collection('conversations');
    const conversations = await collection.find({ participants: userId }).toArray();
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
});

router.post('/conversations', async (req, res) => {
    const { participants } = req.body; // An array of user IDs
    if (new Set(participants).size !== participants.length) {
      return res.status(400).json({ success: false, message: 'Participants should be unique' });
    }
    console.log('Creating conversation with participants:', participants);
    try {
      const collection = await db.collection('conversations');
      const conversation = await collection.insertOne({ participants, messages: [], lastUpdated: new Date() });
      res.status(201).json({ success: true, conversationId: conversation.insertedId });
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ success: false, message: 'Failed to create conversation' });
    }
  });

router.post('/conversations/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { senderId, text } = req.body;
  if (!ObjectId.isValid(senderId) || !ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid IDs' });
  }
  console.log(`Adding message to conversation ${id} from sender ${senderId}`);
  try {
    const collection = await db.collection('conversations');
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { messages: { _id: new ObjectId(), senderId: new ObjectId(senderId), text, timestamp: new Date() } }, $set: { lastUpdated: new Date() } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error adding message to conversation:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

router.get('/conversations/:id/messages', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid conversation ID' });
  }
  try {
    const collection = await db.collection('conversations');
    const conversation = await collection.findOne({ _id: new ObjectId(id) });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    res.status(200).json({ success: true, messages: conversation.messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

export default router;