import React, { useState, useEffect, useRef } from 'react';
import socket from '../config/socket.js';
import { apiFetch } from '../config/api.js';
import { toast } from 'react-toastify';

function Chat({ userId, userName, userEmail, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatId, setChatId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history
  useEffect(() => {
    const loadChat = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch(`/api/chat/user/${userId}`);
        const data = await response.json();

        if (data.success) {
          setChatId(data.chat._id);
          setMessages(data.chat.messages || []);
          setUnreadCount(data.chat.unreadCount?.user || 0);
          
          // Mark messages as read when chat is opened
          if (data.chat.unreadCount?.user > 0) {
            await apiFetch(`/api/chat/${data.chat._id}/read`, {
              method: 'PUT',
              body: JSON.stringify({ userType: 'user' })
            });
            setUnreadCount(0);
          }
        }
      } catch (error) {
        console.error('Error loading chat:', error);
        toast.error('Failed to load chat');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadChat();
    }
  }, [userId]);

  // Socket.io connection handling
  useEffect(() => {
    // Check connection status
    setIsConnected(socket.connected);

    // Join user room
    if (userId && socket.connected) {
      socket.emit('join_user_room', { userId });
    }

    // Handle connection events
    const onConnect = () => {
      setIsConnected(true);
      if (userId) {
        socket.emit('join_user_room', { userId });
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Handle new messages
    const onNewMessage = (data) => {
      if (data.chatId === chatId || data.userId === userId) {
        setMessages(prev => [...prev, data.message]);
        if (data.message.sender === 'admin') {
          setUnreadCount(prev => prev + 1);
        }
        scrollToBottom();
      }
    };

    // Handle message sent confirmation
    const onMessageSent = (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => {
          const exists = prev.some(msg => 
            msg.timestamp === data.message.timestamp && 
            msg.message === data.message.message
          );
          if (!exists) {
            return [...prev, data.message];
          }
          return prev;
        });
        scrollToBottom();
      }
    };

    // Handle admin typing
    const onAdminTyping = (data) => {
      setAdminTyping(data.isTyping);
    };

    // Handle messages read
    const onMessagesRead = () => {
      // Update read status if needed
    };

    // Handle errors
    const onError = (error) => {
      toast.error(error.message || 'An error occurred');
    };

    socket.on('new_message', onNewMessage);
    socket.on('message_sent', onMessageSent);
    socket.on('admin_typing', onAdminTyping);
    socket.on('messages_read', onMessagesRead);
    socket.on('error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_message', onNewMessage);
      socket.off('message_sent', onMessageSent);
      socket.off('admin_typing', onAdminTyping);
      socket.off('messages_read', onMessagesRead);
      socket.off('error', onError);
    };
  }, [userId, chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { userId, isTyping: true, sender: 'user' });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', { userId, isTyping: false, sender: 'user' });
    }, 1000);
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected) {
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage('');

    // Stop typing indicator
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('typing', { userId, isTyping: false, sender: 'user' });

    // Send message via socket
    socket.emit('send_message', {
      userId,
      message: messageText,
      sender: 'user'
    });
  };

  // Mark messages as read when chat is visible
  useEffect(() => {
    if (chatId && unreadCount > 0) {
      const markAsRead = async () => {
        try {
          await apiFetch(`/api/chat/${chatId}/read`, {
            method: 'PUT',
            body: JSON.stringify({ userType: 'user' })
          });
          setUnreadCount(0);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      };
      markAsRead();
    }
  }, [chatId]);

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-[#1d1d1f] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-[#0b0b0c] border-b border-white/10 p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <div>
            <h3 className="text-white font-medium text-lg">EditCo Media Team</h3>
            <p className="text-white/60 text-xs">
              {isConnected ? 'Online' : 'Connecting...'}
              {adminTyping && ' • Typing...'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffd600]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-white/60 py-8">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  msg.sender === 'user'
                    ? 'bg-[#ffd600] text-black'
                    : 'bg-white/10 text-white'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'user' ? 'text-black/60' : 'text-white/50'
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type your message..."
            disabled={!isConnected}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ffd600]/50 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="px-6 py-2 bg-[#ffd600] text-black rounded-xl font-medium hover:bg-[#fff9be] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;

