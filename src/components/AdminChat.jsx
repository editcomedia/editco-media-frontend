import React, { useState, useEffect, useRef } from 'react';
import socket from '../config/socket.js';
import { apiFetch } from '../config/api.js';
import { toast } from 'react-toastify';

function AdminChat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  // Format last message time
  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format date for user details
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load all chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch('/api/chat/all');
        const data = await response.json();

        if (data.success) {
          setChats(data.data || []);
          if (data.data && data.data.length > 0 && !selectedChat) {
            setSelectedChat(data.data[0]);
          }
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        toast.error('Failed to load chats');
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages || []);
      
      // Mark messages as read
      if (selectedChat.unreadCount?.admin > 0) {
        const markAsRead = async () => {
          try {
            await apiFetch(`/api/chat/${selectedChat._id}/read`, {
              method: 'PUT',
              body: JSON.stringify({ userType: 'admin' })
            });
            // Update local state
            setChats(prev => prev.map(chat => 
              chat._id === selectedChat._id 
                ? { ...chat, unreadCount: { ...chat.unreadCount, admin: 0 } }
                : chat
            ));
          } catch (error) {
            console.error('Error marking messages as read:', error);
          }
        };
        markAsRead();
      }
    }
  }, [selectedChat]);

  // Fetch user details when chat is selected
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!selectedChat || !selectedChat.userId) {
        setSelectedUserDetails(null);
        return;
      }

      setLoadingUserDetails(true);
      try {
        // Try to fetch user profile first
        try {
          const response = await apiFetch(`/api/users/profile/${selectedChat.userId}`);
          const data = await response.json();
          
          if (data.success && data.user) {
            setSelectedUserDetails(data.user);
            setLoadingUserDetails(false);
            return;
          }
        } catch (error) {
          console.log('User profile endpoint failed, trying admin users endpoint...');
        }

        // Fallback: fetch all users and find the matching one
        const response = await apiFetch('/api/admin/users');
        const data = await response.json();
        
        if (data.success && data.data) {
          const user = data.data.find(u => u._id === selectedChat.userId);
          if (user) {
            setSelectedUserDetails(user);
          } else {
            setSelectedUserDetails(null);
          }
        } else {
          setSelectedUserDetails(null);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setSelectedUserDetails(null);
      } finally {
        setLoadingUserDetails(false);
      }
    };

    fetchUserDetails();
  }, [selectedChat]);

  // Socket.io connection handling
  useEffect(() => {
    setIsConnected(socket.connected);

    // Join admin room
    if (socket.connected) {
      socket.emit('join_admin_room');
    }

    const onConnect = () => {
      setIsConnected(true);
      socket.emit('join_admin_room');
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Handle new messages
    const onNewMessage = (data) => {
      // Update chat list
      setChats(prev => {
        const chatIndex = prev.findIndex(chat => chat._id === data.chatId || chat.userId === data.userId);
        if (chatIndex >= 0) {
          const updatedChats = [...prev];
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            messages: [...(updatedChats[chatIndex].messages || []), data.message],
            lastMessageAt: new Date(),
            unreadCount: {
              ...updatedChats[chatIndex].unreadCount,
              admin: data.message.sender === 'user' 
                ? (updatedChats[chatIndex].unreadCount?.admin || 0) + 1
                : updatedChats[chatIndex].unreadCount?.admin || 0
            }
          };
          return updatedChats;
        } else {
          // New chat - add to list
          return [{
            _id: data.chatId,
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail,
            messages: [data.message],
            lastMessageAt: new Date(),
            unreadCount: { user: 0, admin: data.message.sender === 'user' ? 1 : 0 }
          }, ...prev];
        }
      });

      // Update messages if this is the selected chat
      if (selectedChat && (selectedChat._id === data.chatId || selectedChat.userId === data.userId)) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    };

    // Handle message sent confirmation
    const onMessageSent = (data) => {
      if (selectedChat && selectedChat._id === data.chatId) {
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

    // Handle user typing
    const onUserTyping = (data) => {
      setUserTyping(prev => ({
        ...prev,
        [data.userId]: data.isTyping
      }));
    };

    // Handle messages read
    const onMessagesRead = (data) => {
      if (data.userType === 'user') {
        // User read admin's messages
        setChats(prev => prev.map(chat => 
          chat._id === data.chatId 
            ? { ...chat, unreadCount: { ...chat.unreadCount, user: 0 } }
            : chat
        ));
      }
    };

    // Handle errors
    const onError = (error) => {
      toast.error(error.message || 'An error occurred');
    };

    socket.on('new_message', onNewMessage);
    socket.on('message_sent', onMessageSent);
    socket.on('user_typing', onUserTyping);
    socket.on('messages_read', onMessagesRead);
    socket.on('error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_message', onNewMessage);
      socket.off('message_sent', onMessageSent);
      socket.off('user_typing', onUserTyping);
      socket.off('messages_read', onMessagesRead);
      socket.off('error', onError);
    };
  }, [selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping && selectedChat) {
      setIsTyping(true);
      socket.emit('typing', { 
        userId: selectedChat.userId, 
        isTyping: true, 
        sender: 'admin' 
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedChat) {
        socket.emit('typing', { 
          userId: selectedChat.userId, 
          isTyping: false, 
          sender: 'admin' 
        });
      }
    }, 1000);
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected || !selectedChat) {
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage('');

    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('typing', { 
      userId: selectedChat.userId, 
      isTyping: false, 
      sender: 'admin' 
    });

    socket.emit('send_message', {
      userId: selectedChat.userId,
      message: messageText,
      sender: 'admin'
    });
  };

  // Filter chats based on search
  const filteredChats = chats.filter(chat => 
    chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort chats by last message time and unread count
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.unreadCount?.admin > 0 && b.unreadCount?.admin === 0) return -1;
    if (a.unreadCount?.admin === 0 && b.unreadCount?.admin > 0) return 1;
    return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
  });

  const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount?.admin || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Chat List */}
      <div className="lg:col-span-1 bg-[#1d1d1f] border border-white/10 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium text-lg">Conversations</h3>
            {totalUnread > 0 && (
              <span className="bg-[#ffd600] text-black text-xs font-bold px-2 py-1 rounded-full">
                {totalUnread}
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ffd600]/50"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffd600]"></div>
            </div>
          ) : sortedChats.length === 0 ? (
            <div className="text-center text-white/60 py-8 px-4">
              <p>No conversations found</p>
            </div>
          ) : (
            sortedChats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 text-left border-b border-white/5 hover:bg-white/5 transition-colors ${
                  selectedChat?._id === chat._id ? 'bg-white/10' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-medium truncate">{chat.userName}</h4>
                      {chat.unreadCount?.admin > 0 && (
                        <span className="bg-[#ffd600] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                          {chat.unreadCount.admin}
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm truncate">{chat.userEmail}</p>
                    {chat.messages && chat.messages.length > 0 && (
                      <p className="text-white/50 text-xs mt-1 truncate">
                        {chat.messages[chat.messages.length - 1].message}
                      </p>
                    )}
                  </div>
                  <div className="text-white/40 text-xs ml-2">
                    {formatLastMessageTime(chat.lastMessageAt)}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window - Split View */}
      <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Messages Section */}
        <div className="lg:col-span-2 bg-[#1d1d1f] border border-white/10 rounded-xl flex flex-col">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/10 bg-[#0b0b0c] rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium text-lg">{selectedChat.userName}</h3>
                    <p className="text-white/60 text-sm">{selectedChat.userEmail}</p>
                    {userTyping[selectedChat.userId] && (
                      <p className="text-white/50 text-xs mt-1">Typing...</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span className="text-white/60 text-xs">{isConnected ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-white/60 py-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          msg.sender === 'admin'
                            ? 'bg-[#ffd600] text-black'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'admin' ? 'text-black/60' : 'text-white/50'
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
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
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
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white/60">
                <p className="text-lg mb-2">Select a conversation</p>
                <p className="text-sm">Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>

        {/* User Details Panel */}
        <div className="lg:col-span-1 lg:sticky lg:top-6 lg:h-fit">
          {selectedChat ? (
            loadingUserDetails ? (
              <div className="bg-[#1d1d1f] border border-white/10 rounded-xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffd600] mx-auto mb-4"></div>
                  <p className="text-white/70 text-sm">Loading user details...</p>
                </div>
              </div>
            ) : selectedUserDetails ? (
              <div className="bg-[#1d1d1f] border border-white/10 rounded-xl p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                <h2 className="text-[20px] md:text-[24px] font-medium text-white mb-6">
                  <span className="text-[#AAA80F]">User</span> <span className="text-[#63676A]">Details</span>
                </h2>

                {/* Personal Information */}
                <div className="mb-6">
                  <h3 className="text-white font-medium text-[16px] md:text-[18px] mb-4">Personal Information</h3>
                  <div className="space-y-3 text-white/70 text-[14px] md:text-[16px]">
                    <p><span className="text-white/90 font-medium">Name:</span> {selectedUserDetails.firstName} {selectedUserDetails.lastName}</p>
                    <p><span className="text-white/90 font-medium">Username:</span> @{selectedUserDetails.username}</p>
                    <p><span className="text-white/90 font-medium">Email:</span> {selectedUserDetails.email}</p>
                    {selectedUserDetails.phoneNumber && (
                      <p><span className="text-white/90 font-medium">Phone:</span> {selectedUserDetails.phoneNumber}</p>
                    )}
                    {selectedUserDetails.companyName && (
                      <p><span className="text-white/90 font-medium">Company:</span> {selectedUserDetails.companyName}</p>
                    )}
                  </div>
                </div>

                {/* Login History */}
                {selectedUserDetails.loginHistory && selectedUserDetails.loginHistory.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white font-medium text-[16px] md:text-[18px] mb-4">Recent Login History</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedUserDetails.loginHistory.slice().reverse().slice(0, 10).map((login, index) => (
                        <div key={index} className="bg-black/20 border border-white/10 p-3 rounded-lg">
                          <p className="text-white/90 text-[14px] md:text-[16px] font-medium">{formatDate(login.timestamp)}</p>
                          {login.ipAddress && (
                            <p className="text-white/70 text-[12px] md:text-[14px]">IP: {login.ipAddress}</p>
                          )}
                          {login.userAgent && (
                            <p className="text-white/50 text-[11px] md:text-[13px] truncate" title={login.userAgent}>
                              {login.userAgent}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="text-white/50 text-[12px] md:text-[14px] space-y-2 pt-4 border-t border-white/10">
                  <p><span className="text-white/70 font-medium">Registered:</span> {formatDate(selectedUserDetails.createdAt)}</p>
                  {selectedUserDetails.updatedAt && (
                    <p><span className="text-white/70 font-medium">Last Updated:</span> {formatDate(selectedUserDetails.updatedAt)}</p>
                  )}
                  <p><span className="text-white/70 font-medium">ID:</span> <span className="text-[10px]">{selectedUserDetails._id}</span></p>
                </div>
              </div>
            ) : (
              <div className="bg-[#1d1d1f] border border-white/10 rounded-xl p-8 text-center">
                <p className="text-white/70 text-sm">User details not available</p>
              </div>
            )
          ) : (
            <div className="bg-[#1d1d1f] border border-white/10 rounded-xl p-8 text-center">
              <p className="text-white/70 text-sm">Select a conversation to view user details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminChat;

