import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { io } from 'socket.io-client';
import { Send, User, MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Initialize Socket
  useEffect(() => {
    // Connect to the current origin (Vite will proxy /socket.io requests)
    const newSocket = io();
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Handle incoming messages
  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', (message) => {
        if (selectedChat && message.chatId === selectedChat._id) {
          setMessages((prev) => [...prev, message]);
        }
        // Update last message in chats list
        setChats((prevChats) => 
          prevChats.map(c => 
            c._id === message.chatId ? { ...c, lastMessage: message.text, updatedAt: new Date() } : c
          ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
      });
    }
    return () => socket?.off('receiveMessage');
  }, [socket, selectedChat]);

  // Fetch all chats and followed users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chatsRes, followingRes] = await Promise.all([
          axios.get('/api/chat'),
          axios.get('/api/users/following')
        ]);
        setChats(chatsRes.data);
        setFollowedUsers(followingRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleStartChat = async (userId) => {
    try {
      const { data } = await axios.post(`/api/chat/${userId}`);
      // If this chat isn't in our active list, add it
      if (!chats.find(c => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const { data } = await axios.get(`/api/message/${selectedChat._id}`);
          setMessages(data);
          socket?.emit('joinRoom', selectedChat._id);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
    }
  }, [selectedChat, socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const { data } = await axios.post('/api/message', {
        chatId: selectedChat._id,
        text: newMessage
      });

      // Emit to socket
      socket.emit('sendMessage', {
        ...data,
        chatId: selectedChat._id
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p._id !== user._id);
  };

  return (
    <div className="chat-container animate-up">
      <div className="chat-layout glass-card">
        {/* Left Side: Chat List */}
        <div className={`chat-sidebar ${selectedChat ? 'mobile-hide' : ''}`}>
          <div className="sidebar-header">
            <h2>Messages</h2>
          </div>
          <div className="chat-list">
            {/* Followed Users Section */}
            {followedUsers.length > 0 && (
              <div className="sidebar-section">
                <h4 className="section-title">People you follow</h4>
                <div className="followed-users-row">
                  {followedUsers.map(u => (
                    <div 
                      key={u._id} 
                      className="followed-user-chip"
                      onClick={() => handleStartChat(u._id)}
                    >
                      <div className="chip-avatar">{u.name.charAt(0)}</div>
                      <span>{u.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h4 className="section-title" style={{ padding: '0 2.25rem', marginTop: '1.5rem' }}>Recent Chats</h4>
            {chats.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 2.25rem' }}>
                <MessageCircle size={48} opacity={0.2} />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div style={{ paddingBottom: '2rem' }}>
                {chats.map((chat) => (
                  <div 
                    key={chat._id} 
                    className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                    onClick={() => setSelectedChat(chat)}
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
                  >
                    <div className="chat-avatar">
                      {getOtherParticipant(chat)?.name?.charAt(0)}
                    </div>
                    <div className="chat-info">
                      <div className="chat-name">{getOtherParticipant(chat)?.name}</div>
                      <div className="chat-last-msg">{chat.lastMessage}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Message Window */}
        <div className={`chat-main ${!selectedChat ? 'mobile-hide' : ''}`}>
          {selectedChat ? (
            <>
              <div className="chat-header">
                <button className="back-btn" onClick={() => setSelectedChat(null)}>
                  <ArrowLeft size={20} />
                </button>
                <div className="header-avatar">
                  {getOtherParticipant(selectedChat)?.name?.charAt(0)}
                </div>
                <div className="header-info">
                  <h3>{getOtherParticipant(selectedChat)?.name}</h3>
                  <span>@{getOtherParticipant(selectedChat)?.username}</span>
                </div>
              </div>

              <div className="message-window">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`message-bubble ${msg.sender === user._id ? 'sent' : 'received'}`}
                  >
                    <div className="message-text">{msg.text}</div>
                    <div className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input-area" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="send-btn">
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="chat-placeholder">
              <MessageCircle size={64} opacity={0.1} />
              <h3>Select a chat to start messaging</h3>
              <p>Chat with users you follow to discuss articles and ideas.</p>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .chat-container {
          height: calc(100vh - 120px);
          max-height: 800px;
          margin: 2rem 0;
        }

        .chat-layout {
          display: flex;
          height: 100%;
          overflow: hidden;
          padding: 0 !important;
          border-radius: 20px;
        }

        .chat-sidebar {
          width: 350px;
          border-right: 1px solid var(--card-border);
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.02);
        }

        .sidebar-header {
          padding: 2.5rem 2.25rem;
          border-bottom: 1px solid var(--card-border);
        }

        .sidebar-header h2 {
          font-size: 1.85rem;
          margin: 0;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-section {
          padding: 2rem 2.25rem;
          border-bottom: 1px solid var(--card-border);
          background: rgba(255, 255, 255, 0.015);
        }

        .section-title {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          font-weight: 900;
          opacity: 0.6;
        }

        .followed-users-row {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .followed-users-row::-webkit-scrollbar {
          height: 4px;
        }

        .followed-users-row::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .followed-user-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          min-width: 60px;
          transition: transform 0.2s;
        }

        .followed-user-chip:hover {
          transform: translateY(-2px);
        }

        .chip-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid var(--primary);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .followed-user-chip span {
          font-size: 0.75rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .chat-list {
          flex: 1;
          overflow-y: auto;
        }

        .chat-item {
          display: flex;
          align-items: center;
          padding: 1.25rem 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .chat-item:hover {
          background: rgba(99, 102, 241, 0.05);
        }

        .chat-item.active {
          background: rgba(99, 102, 241, 0.1);
          border-left: 3px solid var(--primary);
        }

        .chat-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          margin-right: 1rem;
        }

        .chat-info {
          flex: 1;
          min-width: 0;
        }

        .chat-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .chat-last-msg {
          font-size: 0.85rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: rgba(0, 0, 0, 0.1);
        }

        .chat-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--card-border);
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.02);
        }

        .header-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          margin-right: 1rem;
        }

        .header-info h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .header-info span {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .message-window {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message-bubble {
          max-width: 70%;
          padding: 0.75rem 1rem;
          border-radius: 15px;
          font-size: 0.95rem;
          position: relative;
          animation: fadeIn 0.3s ease;
        }

        .message-bubble.sent {
          align-self: flex-end;
          background: var(--primary);
          color: white;
          border-bottom-right-radius: 2px;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .message-bubble.received {
          align-self: flex-start;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-bottom-left-radius: 2px;
        }

        .message-time {
          font-size: 0.7rem;
          margin-top: 0.25rem;
          opacity: 0.7;
          text-align: right;
        }

        .message-input-area {
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid var(--card-border);
        }

        .message-input-area input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--card-border);
          padding: 0.75rem 1.25rem;
          border-radius: 50px;
          color: white;
          outline: none;
          transition: all 0.3s;
        }

        .message-input-area input:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
        }

        .send-btn {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .send-btn:hover {
          transform: scale(1.1);
          filter: brightness(1.1);
        }

        .chat-placeholder {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          text-align: center;
          padding: 2rem;
        }

        .chat-placeholder h3 {
          margin: 1.5rem 0 0.5rem;
          color: white;
        }

        .back-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          margin-right: 1rem;
          cursor: pointer;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .chat-sidebar { width: 100%; }
          .mobile-hide { display: none; }
          .back-btn { display: block; }
        }
      `}} />
    </div>
  );
};

export default Chat;
