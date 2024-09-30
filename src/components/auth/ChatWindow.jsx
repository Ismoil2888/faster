import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref as databaseRef, onValue } from "firebase/database";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";

const ChatWindow = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase();
    const userRef = databaseRef(db, `users/${userId}`);

    const fetchUserData = () => {
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData(data);
          updateStatus(data.status, data.lastActive);
        }
      });
    };

    const updateStatus = (status, lastActive) => {
      if (status === "online") {
        setOnlineStatus("в сети");
      } else if (lastActive) {
        setOnlineStatus(`был(а) в ${lastActive}`);
      } else {
        setOnlineStatus("offline");
      }
    };

    fetchUserData();
  }, [userId]);

  const handleBackClick = () => {
    navigate(-1); // Возврат на предыдущую страницу
  };

  return (
    <div className="chat-window">
      {/* Шапка чата */}
      <div className="chat-header">
        <button onClick={handleBackClick}>
          <FaArrowLeft />
        </button>
        <div className="chat-header-info">
          {/* Отображение аватара пользователя */}
          <img
            src={userData?.avatarUrl || "./default-avatar.png"}
            alt="User Avatar"
            className="avatar-small"
          />
          <div className="cu-cs-block">
            <h2 className="chat-username">{userData?.username}</h2>
            <p className="chat-status">{onlineStatus}</p>
          </div>
        </div>
      </div>

      {/* Область сообщений */}
      <div className="chat-messages">
        <p>Message history will appear here...</p>
      </div>

      {/* Поле для ввода сообщения */}
      <div className="chat-input">
        <input type="text" placeholder="Type a message..." />
        <button>
        <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;





// import React, { useState, useEffect } from "react";
// import { FaArrowLeft } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { getDatabase, ref as databaseRef, onValue, push, serverTimestamp } from "firebase/database";

// const ChatWindow = ({ recipientId, senderId }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [recipientData, setRecipientData] = useState(null);
//   const [onlineStatus, setOnlineStatus] = useState("");
//   const [loading, setLoading] = useState(true); // New state for loading status
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!recipientId || !senderId) {
//       console.error("Missing recipientId or senderId");
//       return;
//     }

//     const db = getDatabase();
//     const recipientRef = databaseRef(db, `users/${recipientId}`);
    
//     // Формируем идентификатор чата
//     const chatId = [senderId, recipientId].sort().join("-");
//     const chatRef = databaseRef(db, `chats/${chatId}/messages`);

//     // Fetch recipient's data
//     const unsubscribeRecipient = onValue(recipientRef, (snapshot) => {
//       const data = snapshot.val();
//       console.log("Recipient data:", data); // Log for debugging
//       if (data) {
//         setRecipientData(data);
//         updateStatus(data.status, data.lastActive); // Update online status
//       } else {
//         console.warn(`No data found for recipientId: ${recipientId}`);
//       }
//     });

//     // Fetch chat messages
//     const unsubscribeChat = onValue(chatRef, (snapshot) => {
//       const messagesData = snapshot.val();
//       if (messagesData) {
//         const loadedMessages = Object.values(messagesData);
//         setMessages(loadedMessages);
//       } else {
//         console.log("No messages found.");
//       }
//       setLoading(false); // Stop loading once messages are fetched
//     }, (error) => {
//       console.error("Error fetching chat messages:", error);
//       setLoading(false); // Stop loading on error
//     });

//     // Cleanup on unmount
//     return () => {
//       unsubscribeRecipient();
//       unsubscribeChat();
//     };
//   }, [recipientId, senderId]);

//   const updateStatus = (status, lastActive) => {
//     if (status === "online") {
//       setOnlineStatus("в сети");
//     } else if (lastActive) {
//       setOnlineStatus(`был(а) в сети: ${lastActive}`);
//     } else {
//       setOnlineStatus("offline");
//     }
//   };

//   const handleSendMessage = () => {
//     if (!newMessage.trim()) {
//       console.warn("Cannot send an empty message");
//       return;
//     }

//     const db = getDatabase();
//     const chatId = [senderId, recipientId].sort().join("-");
//     const chatRef = databaseRef(db, `chats/${chatId}/messages`);

//     // Message object
//     const newMessageObj = {
//       senderId: senderId,
//       recipientId: recipientId,
//       text: newMessage,
//       timestamp: serverTimestamp(), // Use server timestamp for accurate timing
//     };

//     // Send message to Firebase
//     push(chatRef, newMessageObj)
//       .then(() => {
//         console.log("Message sent successfully");
//         setNewMessage(""); // Clear the input after sending
//       })
//       .catch((error) => {
//         console.error("Error sending message:", error);
//       });
//   };

//   if (loading) {
//     return <p>Loading...</p>; // Show loading state
//   }

//   if (!recipientData) {
//     return <p>No recipient data available</p>; // Error state if no data for recipient
//   }

//   return (
//     <div className="chat-window">
//       {/* Chat header with avatar, name, and status */}
//       <div className="chat-header">
//         <FaArrowLeft className="back-icon" onClick={() => navigate(-1)} />
//         <img
//           src={recipientData.avatarUrl || "./default-image.png"}
//           alt={recipientData.username}
//           className="chat-avatar"
//         />
//         <div className="chat-info">
//           <h2>{recipientData.username}</h2>
//           <p className="online-status">{onlineStatus}</p>
//         </div>
//       </div>

//       {/* Chat messages */}
//       <div className="messages">
//         {messages.length > 0 ? (
//           messages.map((message) => (
//             <div
//               key={message.timestamp} // Use timestamp as key
//               className={`message ${message.senderId === senderId ? "sent" : "received"}`}
//             >
//               <p>{message.text}</p>
//               <span className="message-timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
//             </div>
//           ))
//         ) : (
//           <p>Сообщений пока нет...</p> // Updated text for consistency
//         )}
//       </div>

//       {/* Message input */}
//       <div className="message-input">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           placeholder="Написать сообщение..."
//         />
//         <button onClick={handleSendMessage} disabled={!newMessage.trim()}>Send</button>
//       </div>
//     </div>
//   );
// };

// export default ChatWindow;





// // import React, { useState, useEffect } from "react";
// // import { FaArrowLeft } from "react-icons/fa";
// // import { useNavigate } from "react-router-dom";
// // import { getDatabase, ref as databaseRef, onValue, push } from "firebase/database";

// // const ChatWindow = ({ recipientId, senderId }) => {
// //   const [messages, setMessages] = useState([]);
// //   const [newMessage, setNewMessage] = useState("");
// //   const [recipientData, setRecipientData] = useState(null);
// //   const [onlineStatus, setOnlineStatus] = useState("");
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     const db = getDatabase();
// //     const recipientRef = databaseRef(db, `users/${recipientId}`);
// //     const chatRef = databaseRef(db, `chats/${recipientId}-${senderId}/messages`);

// //     // Fetch recipient's data
// //     onValue(recipientRef, (snapshot) => {
// //       const data = snapshot.val();
// //       console.log("Recipient data:", data); // Добавьте лог для проверки данных
// //       if (data) {
// //         setRecipientData(data);
// //         updateStatus(data.status, data.lastActive); // Update online status
// //       }
// //     });

// //     // Fetch chat messages
// //     onValue(chatRef, (snapshot) => {
// //       const messagesData = snapshot.val();
// //       if (messagesData) {
// //         const loadedMessages = Object.values(messagesData);
// //         setMessages(loadedMessages);
// //       }
// //     });
// //   }, [recipientId, senderId]);

// //   const updateStatus = (status, lastActive) => {
// //     if (status === "online") {
// //       setOnlineStatus("в сети");
// //     } else if (lastActive) {
// //       setOnlineStatus(`был(а) в сети: ${lastActive}`);
// //     } else {
// //       setOnlineStatus("offline");
// //     }
// //   };

// //   const handleSendMessage = () => {
// //     if (newMessage.trim()) {
// //       const db = getDatabase();
// //       const chatRef = databaseRef(db, `chats/${recipientId}-${senderId}/messages`);
      
// //       // Send message to Firebase
// //       const newMessageObj = {
// //         senderId: senderId,
// //         text: newMessage,
// //         timestamp: new Date().toISOString()
// //       };

// //       push(chatRef, newMessageObj); // Add message to Firebase

// //       setNewMessage(""); // Clear the input
// //     }
// //   };

// //   if (!recipientData) {
// //     return <p>Loading...</p>;
// //   }

// //   return (
// //     <div className="chat-window">
// //       {/* Chat header with avatar, name, and status */}
// //       <div className="chat-header">
// //         <FaArrowLeft className="back-icon" onClick={() => navigate(-1)} />
// //         <img
// //           src={recipientData.avatarUrl || "./default-image.png"}
// //           alt={recipientData.username}
// //           className="chat-avatar"
// //         />
// //         <div className="chat-info">
// //           <h2>{recipientData.username}</h2>
// //           <p className="online-status">{onlineStatus}</p>
// //         </div>
// //       </div>

// //       {/* Chat messages */}
// //       <div className="messages">
// //         {messages.length > 0 ? (
// //           messages.map((message, index) => (
// //             <div
// //               key={index}
// //               className={`message ${message.senderId === senderId ? "sent" : "received"}`}
// //             >
// //               <p>{message.text}</p>
// //             </div>
// //           ))
// //         ) : (
// //           <p>No messages yet...</p>
// //         )}
// //       </div>

// //       {/* Message input */}
// //       <div className="message-input">
// //         <input
// //           type="text"
// //           value={newMessage}
// //           onChange={(e) => setNewMessage(e.target.value)}
// //           placeholder="Написать сообщение..."
// //         />
// //         <button onClick={handleSendMessage}>Send</button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ChatWindow;