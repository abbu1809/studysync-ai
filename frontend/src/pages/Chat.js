import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiMessageCircle, FiTrash2 } from 'react-icons/fi';
import { chatService } from '../services';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations();
      setConversations(data.conversations || []);
      
      if (data.conversations?.length > 0 && !currentConversation) {
        loadConversation(data.conversations[0].id);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const data = await chatService.getConversation(conversationId);
      setCurrentConversation(data.conversation);
      setMessages(data.conversation.messages || []);
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message optimistically
    const tempUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      setSending(true);
      const data = await chatService.sendMessage({
        message: userMessage,
        conversationId: currentConversation?.id || null
      });

      // Update conversation ID if it's a new conversation
      if (!currentConversation) {
        setCurrentConversation({ id: data.conversationId });
        loadConversations();
      }

      // Replace temp message and add AI response
      setMessages(prev => [
        ...prev.slice(0, -1),
        tempUserMessage,
        data.message
      ]);
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => prev.slice(0, -1)); // Remove temp message
    } finally {
      setSending(false);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm('Delete this conversation?')) return;

    try {
      await chatService.deleteConversation(conversationId);
      toast.success('Conversation deleted');
      
      if (currentConversation?.id === conversationId) {
        handleNewConversation();
      }
      
      loadConversations();
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const suggestedQuestions = [
    "What topics should I study first?",
    "Explain this concept in simple terms",
    "Create a study plan for my upcoming exam",
    "What are the key points I should remember?"
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col bg-gray-50">
        <div className="p-4 border-b bg-white">
          <button
            onClick={handleNewConversation}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <FiMessageCircle /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversation?.id === conv.id
                    ? 'bg-indigo-50 border-2 border-indigo-300'
                    : 'bg-white hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{conv.title || 'New Conversation'}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {conv.updatedAt && !isNaN(new Date(conv.updatedAt)) && format(new Date(conv.updatedAt), 'MMM dd, hh:mm a')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
              <FiMessageCircle className="text-6xl text-indigo-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">AI Study Assistant</h2>
              <p className="text-gray-600 text-center mb-8">
                Ask me anything about your studies, assignments, or syllabus!
              </p>

              <div className="w-full">
                <p className="text-sm font-medium mb-3">Suggested questions:</p>
                <div className="grid grid-cols-2 gap-3">
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(question)}
                      className="p-3 text-left text-sm border rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp && !isNaN(new Date(message.timestamp)) && format(new Date(message.timestamp), 'hh:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-6 py-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="input-field flex-1"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="btn-primary px-6 flex items-center gap-2"
              >
                <FiSend /> Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
