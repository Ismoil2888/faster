import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaSearch, FaTimes } from "react-icons/fa";
import { database } from "../../firebase"; // Assuming Firebase is configured in this file
import { getDatabase, ref as databaseRef, query, orderByChild, startAt, endAt, get } from "firebase/database";
import { useNavigate } from "react-router-dom"; // Импортируем для навигации
import { Link } from "react-router-dom";

const ChatPage = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const menuRef = useRef(null);
  const navigate = useNavigate(); // Используем навигацию

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
          results.push({ uid: childSnapshot.key, ...childSnapshot.val() }); // Добавляем uid для навигации
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
  };

  const goToProfile = (userId) => {
    navigate(`/profile/${userId}`); // Переход на страницу профиля пользователя
  };

  const goToProfileSettings = () => {
    navigate("/authdetails"); // Navigate to the "/authdetails" route
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
          <li onClick={goToProfileSettings}>
              Настройки профиля {/* Use onClick handler */}
          </li>
            <li>Конфиденциальность</li>
            <li>Помощь</li>
            <li>Выход</li>
          </ul>
        </div>
      )}

      {showSearch && (
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Искать пользователей"
          />
          <FaTimes className="close-search" onClick={() => setShowSearch(false)} />
        </div>
      )}

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
          <p>No results found</p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;



// import React, { useState, useEffect, useRef } from "react";
// import { FaEllipsisV, FaSearch, FaTimes } from "react-icons/fa";
// import { database } from "../../firebase"; // Assuming Firebase is configured in this file
// import { getDatabase, ref as databaseRef, query, orderByChild, startAt, endAt, get } from "firebase/database";

// const ChatPage = () => {
//   const [showMenu, setShowMenu] = useState(false);
//   const [showSearch, setShowSearch] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const menuRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setShowMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleSearch = async (queryText) => {
//     setSearchQuery(queryText);
    
//     if (queryText.trim() === "") {
//       setSearchResults([]);
//       return;
//     }
  
//     try {
//       const dbRef = databaseRef(getDatabase(), "users");
//       const userQuery = query(
//         dbRef,
//         orderByChild("username"),
//         startAt(queryText),
//         endAt(queryText + "\uf8ff")
//       );
  
//       const snapshot = await get(userQuery);
  
//       const results = [];
//       if (snapshot.exists()) {
//         snapshot.forEach((childSnapshot) => {
//           results.push(childSnapshot.val());
//         });
//       }
  
//       setSearchResults(results);
//     } catch (error) {
//       console.error("Error fetching data from Firebase:", error);
//     }
//   };  

//   return (
//     <div className="chat-page">
//       <div className="header">
//         <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
//           <FaEllipsisV />
//         </div>
//         <h1>Faster</h1>
//         <div className="search-icon" onClick={() => setShowSearch(!showSearch)}>
//           <FaSearch />
//         </div>
//       </div>

//       {showMenu && (
//         <div className="menu-dropdown" ref={menuRef}>
//           <ul>
//             <li>Настройки профиля</li>
//             <li>Конфиденциальность</li>
//             <li>Помощь</li>
//             <li>Выход</li>
//           </ul>
//         </div>
//       )}

//       {showSearch && (
//         <div className="search-bar">
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => handleSearch(e.target.value)}
//             placeholder="Искать пользователей"
//           />
//           <FaTimes className="close-search" onClick={() => setShowSearch(false)} />
//         </div>
//       )}

//       <div className="chat-list">
//         {searchResults.length > 0 ? (
//           searchResults.map((user) => (
//             <div key={user.uid} className="chat-item">
//               <img src={user.avatarUrl || "./default-avatar.png"} alt={user.username} className="avatar" />
//               <div className="chat-info">
//                 <h3>{user.username}</h3>
//                 <p>{user.aboutMe || "No info available"}</p>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p>No results found</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatPage;