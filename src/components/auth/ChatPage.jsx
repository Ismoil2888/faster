import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaSearch, FaTimes } from "react-icons/fa";
import { getDatabase, ref as databaseRef, query, orderByChild, startAt, endAt, get } from "firebase/database";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Загружаем историю поиска из localStorage при загрузке компонента
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setSearchHistory(savedHistory);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = async (queryText) => {
    setSearchQuery(queryText);

    if (queryText.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      const dbRef = databaseRef(getDatabase(), "users");
      const userQuery = query(
        dbRef,
        orderByChild("username"),
        startAt(queryText),
        endAt(queryText + "\uf8ff")
      );

      const snapshot = await get(userQuery);

      const results = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          results.push({ uid: childSnapshot.key, ...childSnapshot.val() });
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
  };

  // Функция для перехода на профиль и добавления аккаунта в историю после посещения
  const goToProfile = (userId) => {
    const visitedUser = searchResults.find((user) => user.uid === userId);
    if (visitedUser) {
      const updatedHistory = [visitedUser, ...searchHistory.filter(item => item.uid !== visitedUser.uid)];
      setSearchHistory(updatedHistory);
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    }
    navigate(`/profile/${userId}`);
  };

  const goToProfileSettings = () => {
    navigate("/authdetails");
  };

  // Функция для очистки истории поиска
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  // Функция для удаления конкретного элемента из истории
  const removeFromHistory = (userId) => {
    const updatedHistory = searchHistory.filter(user => user.uid !== userId);
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  return (
    <div className="chat-page">
      <div className="header">
        <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
          <FaEllipsisV />
        </div>
        <h1>Faster</h1>
        <div className="search-icon" onClick={() => setShowSearch(!showSearch)}>
          <FaSearch />
        </div>
      </div>

      {showMenu && (
        <div className="menu-dropdown" ref={menuRef}>
          <ul>
            <li onClick={goToProfileSettings}>Настройки профиля</li>
            <li>Конфиденциальность</li>
            <li>Помощь</li>
            <li>Выход</li>
          </ul>
        </div>
      )}

      {showSearch && (
        <>
          {/* Поисковая строка */}
          <div className="search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Искать пользователей"
            />
            <FaTimes className="close-search" onClick={() => setShowSearch(false)} />
          </div>

          {/* Отображаем историю поиска при активном поиске */}
          {searchHistory.length > 0 && (
            <div className="search-history">
              <div className="history-header">
                <h3>Недавнее</h3>
                <span onClick={clearSearchHistory} className="clear-history">
                  Очистить все
                </span>
              </div>
              {searchHistory.map((user) => (
                <div key={user.uid} className="chat-item">
                  <img src={user.avatarUrl || "./default-image.png"} alt={user.username} className="avatarka" />
                  <div className="chat-info">
                    <h3>{user.username}</h3>
                    <p>{user.aboutMe || "No info available"}</p>
                  </div>
                  <FaTimes className="remove-from-history" onClick={() => removeFromHistory(user.uid)} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Результаты поиска */}
      {showSearch && (
        <div className="chat-list">
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div key={user.uid} className="chat-item" onClick={() => goToProfile(user.uid)}>
                <img src={user.avatarUrl || "./default-image.png"} alt={user.username} className="avatarka" />
                <div className="chat-info">
                  <h3>{user.username}</h3>
                  <p>{user.aboutMe || "No info available"}</p>
                </div>
              </div>
            ))
          ) : (
            searchQuery.trim() !== "" && <p>No results found</p> // Условие, показывающее сообщение, если есть запрос и результаты пустые
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPage;