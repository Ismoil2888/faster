import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref as databaseRef, get } from "firebase/database";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

const UserProfilePage = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState("offline");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false); // Состояние для открытия модального окна
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const db = getDatabase();
        const userRef = databaseRef(db, `users/${userId}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          setUserData(snapshot.val());
          setOnlineStatus("online"); // Предполагаемый статус онлайн
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  if (!userData) {
    return <p>Loading...</p>;
  }

  const handleAvatarClick = () => {
    setIsAvatarModalOpen(true); // Открываем модальное окно
  };

  const closeAvatarModal = () => {
    setIsAvatarModalOpen(false); // Закрываем модальное окно
  };

  return (
    <div className="user-profile">
      {/* Стрелка назад */}
      <div className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </div>

      {/* Аватарка пользователя */}
      <img
        src={userData.avatarUrl || "./default-image.png"}
        alt={userData.username}
        className="avatar-large"
        onClick={handleAvatarClick} // Открыть фото при клике
      />

      <h2>{userData.username}</h2>
      <p>Status: {onlineStatus === "online" ? "Online" : "Last seen at ..."} </p>
      <p>About: {userData.aboutMe || "No additional info"}</p>

      <button className="message-button">
        <FaEnvelope /> Send Message
      </button>

      {/* Модальное окно с аватаром во весь экран */}
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