// ChatComponent.jsx
import React, { useState, useEffect } from 'react';
import { getDatabase, ref as databaseRef, onValue, push, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const ChatComponent = ({ recipientId, recipientAvatar, recipientUsername, closeChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const auth = getAuth();
  const currentUserId = auth.currentUser.uid;

  useEffect(() => {
    const db = getDatabase();
    const chatRef = databaseRef(db, `chats/${currentUserId}_${recipientId}`);

    // Load chat messages from Firebase
    const unsubscribe = onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        setMessages(Object.values(snapshot.val()));
      }
    });

    return () => unsubscribe();
  }, [currentUserId, recipientId]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const db = getDatabase();
      const chatRef = databaseRef(db, `chats/${currentUserId}_${recipientId}`);
      const messageRef = push(chatRef);
      set(messageRef, {
        senderId: currentUserId,
        recipientId: recipientId,
        text: newMessage,
        timestamp: new Date().toISOString(),
      });
      setNewMessage("");
    }
  };

  return (
    <div className="chat-component">
      <div className="chat-header">
        <img src={recipientAvatar} alt={recipientUsername} className="chat-avatar" />
        <h3>{recipientUsername}</h3>
        <button onClick={closeChat}>Close</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={msg.senderId === currentUserId ? "message-sent" : "message-received"}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;