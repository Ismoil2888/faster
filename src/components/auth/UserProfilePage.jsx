import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref as databaseRef, onValue, serverTimestamp, onDisconnect } from "firebase/database";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

const UserProfilePage = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState("");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSendMessage = () => {
    navigate(`/chat/${userId}`); // Redirect to the ChatWindow with recipient ID
  };

  useEffect(() => {
    const db = getDatabase();
    const userRef = databaseRef(db, `users/${userId}`);

    // Функция для получения данных пользователя из Realtime Database
    const fetchUserData = async () => {
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData(data);
          updateStatus(userId, data.status, data.lastActive); // Обновляем статус
        }
      });
    };

    // Функция для обновления статуса
    const updateStatus = (userId, status, lastActive) => {
      if (status === "online") {
        setOnlineStatus("в сети");
      } else if (lastActive) {
        setOnlineStatus(`был(а) в сети: ${lastActive}`);
      } else {
        setOnlineStatus("offline");
      }
    };

    fetchUserData();
  }, [userId]);

  if (!userData) {
    return <p>Loading...</p>;
  }

  const handleAvatarClick = () => {
    setIsAvatarModalOpen(true); // Открыть модальное окно для аватара
  };

  const closeAvatarModal = () => {
    setIsAvatarModalOpen(false); // Закрыть модальное окно для аватара
  };

  return (
    <div className="user-profile">
      {/* Кнопка назад */}
      <div className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </div>

      {/* Контейнер для аватарки и имени */}
      <div className="avatar-container">
        {/* Аватар пользователя */}
        <img
          src={userData.avatarUrl || "./default-image.png"}
          alt={userData.username}
          className="avatar-large"
          onClick={handleAvatarClick} // Открыть модальное окно при клике
        />
        {/* Имя пользователя */}
        <h2 className="username">{userData.username}</h2>
      </div>

      <p>{onlineStatus}</p>
      <p>Информация: {userData.aboutMe || "No additional info"}</p>

      <button className="message-button" onClick={handleSendMessage}>
        <FaEnvelope /> Send Message
      </button>

      {/* Модальное окно для аватара */}
      {isAvatarModalOpen && (
        <div className="avatar-modal" onClick={closeAvatarModal}>
          <div className="avatar-modal-content">
            <img
              src={userData.avatarUrl || "./default-image.png"}
              alt="Avatar"
              className="avatar-fullscreen"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;