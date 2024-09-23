// ProfilePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = ({ user }) => {
  const navigate = useNavigate();

  const handleSendMessage = () => {
    navigate(`/chat/${user.uid}`); // Переходим на личный чат с этим пользователем
  };

  return (
    <div>
      <h1>{user.username}'s Profile</h1>
      <button onClick={handleSendMessage}>Send Message</button>
    </div>
  );
};

export default ProfilePage;