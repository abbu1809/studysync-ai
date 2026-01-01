const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const chatController = require('../controllers/chat.controller');
const { validate, schemas } = require('../middleware/validation');

// Send message to chatbot
router.post('/message',
  authenticateUser,
  validate(schemas.chatMessage),
  chatController.sendMessage
);

// Get conversation history
router.get('/conversations', authenticateUser, chatController.getConversations);

// Get specific conversation
router.get('/conversations/:conversationId', authenticateUser, chatController.getConversation);

// Delete conversation
router.delete('/conversations/:conversationId', authenticateUser, chatController.deleteConversation);

module.exports = router;
