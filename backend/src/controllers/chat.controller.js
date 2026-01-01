const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');
const chatService = require('../services/chat.service');
const { v4: uuidv4 } = require('uuid');

/**
 * Send message to chatbot
 */
async function sendMessage(req, res, next) {
  try {
    const { uid } = req.user;
    const { message, conversationId } = req.body;

    // Get or create conversation
    let conversation;
    let conversationRef;

    if (conversationId) {
      conversationRef = db.collection('chatHistory').doc(conversationId);
      const doc = await conversationRef.get();

      if (!doc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      conversation = doc.data();

      if (conversation.userId !== uid) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else {
      // Create new conversation
      const newConversationId = uuidv4();
      conversation = {
        id: newConversationId,
        userId: uid,
        messages: [],
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      conversationRef = db.collection('chatHistory').doc(newConversationId);
      await conversationRef.set(conversation);
    }

    // Get context for AI
    const context = await chatService.getContext(uid);

    // Add user message
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      contextUsed: {
        documents: context.documents.map(d => d.id),
        assignments: context.assignments.map(a => a.id),
        studyPlan: context.studyPlan?.id || null
      }
    };

    conversation.messages.push(userMessage);

    // Generate AI response
    const aiResponse = await chatService.generateResponse({
      message,
      context,
      conversationHistory: conversation.messages
    });

    // Add AI message
    const aiMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      contextUsed: userMessage.contextUsed
    };

    conversation.messages.push(aiMessage);

    // Update conversation
    await conversationRef.update({
      messages: conversation.messages,
      updatedAt: FieldValue.serverTimestamp()
    });

    // Update user stats
    await db.collection('users').doc(uid).update({
      'stats.chatMessages': FieldValue.increment(1)
    });

    res.status(200).json({
      success: true,
      conversationId: conversation.id,
      message: aiMessage
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all conversations
 */
async function getConversations(req, res, next) {
  try {
    const { uid } = req.user;

    const snapshot = await db.collection('chatHistory')
      .where('userId', '==', uid)
      .get();

    const conversations = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: data.id,
          title: data.title,
          messageCount: data.messages.length,
          lastMessage: data.messages[data.messages.length - 1]?.content || '',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
        };
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get specific conversation
 */
async function getConversation(req, res, next) {
  try {
    const { uid } = req.user;
    const { conversationId } = req.params;

    const doc = await db.collection('chatHistory').doc(conversationId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const conversation = doc.data();

    if (conversation.userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Serialize timestamps in messages
    const serializedConversation = {
      ...conversation,
      createdAt: conversation.createdAt?.toDate ? conversation.createdAt.toDate().toISOString() : conversation.createdAt,
      updatedAt: conversation.updatedAt?.toDate ? conversation.updatedAt.toDate().toISOString() : conversation.updatedAt,
      messages: (conversation.messages || []).map(msg => ({
        ...msg,
        timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate().toISOString() : 
                  (msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp)
      }))
    };

    res.status(200).json({
      success: true,
      conversation: serializedConversation
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete conversation
 */
async function deleteConversation(req, res, next) {
  try {
    const { uid } = req.user;
    const { conversationId } = req.params;

    const doc = await db.collection('chatHistory').doc(conversationId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (doc.data().userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await db.collection('chatHistory').doc(conversationId).delete();

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sendMessage,
  getConversations,
  getConversation,
  deleteConversation
};
