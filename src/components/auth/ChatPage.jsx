import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaSearch, FaTimes } from "react-icons/fa";
import { getDatabase, ref as databaseRef, query, orderByChild, startAt, endAt, get, set } from "firebase/database"; // Добавляем set для записи
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ChatPage = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [userUid, setUserUid] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    // Отслеживаем аутентификацию пользователя
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Пользователь вошел в систему, используем его UID
        setUserUid(user.uid);

        // Загружаем историю поиска для конкретного пользователя из Firebase
        const dbRef = databaseRef(getDatabase(), `searchHistory/${user.uid}`);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          setSearchHistory(snapshot.val() || []);
        }
      } else {
        navigate("/login"); // Перенаправляем на страницу входа, если пользователь не аутентифицирован
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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

  const goToProfile = async (userId) => {
    if (userUid) {
      const visitedUser = searchResults.find((user) => user.uid === userId);
      if (visitedUser) {
        const updatedHistory = [visitedUser, ...searchHistory.filter(item => item.uid !== visitedUser.uid)];
        setSearchHistory(updatedHistory);

        // Сохраняем обновленную историю в Firebase
        const dbRef = databaseRef(getDatabase(), `searchHistory/${userUid}`);
        await set(dbRef, updatedHistory);
      }
      navigate(`/profile/${userId}`);
    }
  };

  const goToProfileSettings = () => {
    navigate("/authdetails");
  };

  const clearSearchHistory = async () => {
    setSearchHistory([]);

    // Очищаем историю поиска в Firebase
    const dbRef = databaseRef(getDatabase(), `searchHistory/${userUid}`);
    await set(dbRef, []);
  };

  const removeFromHistory = async (userId) => {
    const updatedHistory = searchHistory.filter(user => user.uid !== userId);
    setSearchHistory(updatedHistory);

    // Обновляем историю поиска в Firebase
    const dbRef = databaseRef(getDatabase(), `searchHistory/${userUid}`);
    await set(dbRef, updatedHistory);
  };

  const goToProfileFromHistory = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
      // Очищаем локальные данные и историю поиска
      setSearchHistory([]);
      navigate("/login");
    });
  };


  const auth = getAuth();
const user = auth.currentUser;

if (user) {
  // Выполняем запрос только если пользователь аутентифицирован
  const dbRef = databaseRef(getDatabase(), "some-path");
  // Делаем запрос к базе данных
} else {
  console.error("User is not authenticated");
}

  return (
    <div className="chat-page">
      <div className="header">
        <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
          <FaEllipsisV />
        </div>

        {/* Секция для отображения историй */}
        <div className="stories-section">
          <div className="story-item">
            <img
              src="./default-image.png"
              alt="Моя история"
              className="story-avatar"
            />
            <p>Моя история</p>
          </div>
        </div>

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
            <li onClick={handleLogout}>Выход</li>
          </ul>
        </div>
      )}

      {showSearch && (
        <>
          <div className="search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Искать пользователей"
            />
            <FaTimes className="close-search" onClick={() => setShowSearch(false)} />
          </div>

          {/* Если пользователь не вводит текст и не в фокусе - показываем историю */}
          {searchHistory.length > 0 && !isInputFocused && searchQuery === "" && (
            <div className="search-history">
              <div className="history-header">
                <h3>Недавнее</h3>
                <span onClick={clearSearchHistory} className="clear-history">
                  Очистить все
                </span>
              </div>
              {searchHistory.map((user) => (
                <div
                  key={user.uid}
                  className="chat-item"
                >
                  <img src={user.avatarUrl || "./default-image.png"} alt={user.username} className="avatarka" />
                  <div
                    className="chat-info"
                    onClick={() => goToProfileFromHistory(user.uid)}
                  >
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
            searchQuery.trim() !== "" && <p>No results found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPage;