import React, { useEffect, useState } from "react";
import { getDatabase, ref as databaseRef, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Message = () => {
  const [chatNotifications, setChatNotifications] = useState([]);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const db = getDatabase();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      const chatsRef = databaseRef(db, `chats`);
      
      onValue(chatsRef, (snapshot) => {
        const notifications = [];
        snapshot.forEach((chatSnapshot) => {
          const chatId = chatSnapshot.key;
          if (chatId.includes(userId)) {
            chatSnapshot.forEach((messageSnapshot) => {
              const message = messageSnapshot.val();
              if (message.senderId !== userId) {
                notifications.push(message);
              }
            });
          }
        });
        setChatNotifications(notifications);
      });
    }
  }, [userId]);

  return (
    <div className="chat-page">
      <h2>Chat Notifications</h2>
      {chatNotifications.map((notification, index) => (
        <div key={index} className="notification" onClick={() => navigate(`/chat/${notification.senderId}`)}>
          <p>New message from {notification.senderId}</p>
        </div>
      ))}
    </div>
  );
};

export default Message;