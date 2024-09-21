import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { ref as databaseRef, onValue, update, get, query, orderByChild, equalTo } from "firebase/database";
import React, { useEffect, useState, useRef } from "react";
import { auth, database, storage } from "../../firebase";
import { Link } from "react-router-dom";
import { FaEllipsisV, FaTimes } from "react-icons/fa"; // Иконка крестика
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";


const AuthDetails = () => {
  const [authUser, setAuthUser] = useState(null);
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("offline");
  const [lastActive, setLastActive] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("./default-image.png");
  const [showMenu, setShowMenu] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [aboutMe, setAboutMe] = useState("Напишите немного о себе");
  const [newAboutMe, setNewAboutMe] = useState("");
  const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
  const [notification, setNotification] = useState(""); // Для уведомления
  const [notificationType, setNotificationType] = useState(""); // Для типа уведомления
  const navigate = useNavigate();

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        setEmail(user.email);

        const userRef = databaseRef(database, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUsername(data.username || "User");
            setPhoneNumber(data.phoneNumber || "+Введите номер телефона");
            setStatus(data.status || "offline");
            setLastActive(data.lastActive || "");
            setAvatarUrl(data.avatarUrl || "./default-image.png");
            setAboutMe(data.aboutMe || "Напишите немного о себе");
          }
        });

        update(userRef, { status: "online" });

        window.addEventListener('beforeunload', () => {
          update(userRef, { status: "offline", lastActive: new Date().toLocaleString() });
        });
      } else {
        setAuthUser(null);
        setUsername("");
        setEmail("");
        setPhoneNumber("");
        setStatus("offline");
        setLastActive("");
        setAvatarUrl("./default-image.png");
      }
    });

    return () => {
      listen();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Функция для успешных уведомлений
  const showNotification = (message) => {
    setNotificationType("success");
    setNotification(message);
    setTimeout(() => {
      setNotification("");
      setNotificationType("");
    }, 3000);
  };

  // Функция для ошибочных уведомлений
  const showNotificationError = (message) => {
    setNotificationType("error");
    setNotification(message);
    setTimeout(() => {
      setNotification("");
      setNotificationType("");
    }, 3000);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file && authUser) {
      try {
        const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`);
        const snapshot = await uploadBytes(avatarStorageRef, file);
        const downloadURL = await getDownloadURL(avatarStorageRef);
        setAvatarUrl(downloadURL);
        const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
        await update(userDatabaseRef, { avatarUrl: downloadURL });
        setShowMenu(false);
      } catch (error) {
        console.error("Ошибка при загрузке изображения:", error);
      }
    }
  };

  const deleteAvatar = async () => {
    if (authUser) {
      try {
        const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`);
        await deleteObject(avatarStorageRef);
        const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
        await update(userDatabaseRef, { avatarUrl: "./default-image.png" });
        setAvatarUrl("./default-image.png");
        setShowMenu(false);
      } catch (error) {
        console.error("Ошибка при удалении изображения:", error);
      }
    }
  };

  const handleUsernameChange = async () => {
    const usernameRegex = /^[a-zA-Z0-9._]+$/; // Валидация имени пользователя
    if (authUser && newUsername.trim() !== "" && usernameRegex.test(newUsername)) {
      try {
        // Проверяем, существует ли уже пользователь с таким именем
        const usersRef = query(databaseRef(database, 'users'), orderByChild('username'), equalTo(newUsername));
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          showNotificationError("Пользователь с таким именем уже существует, выберите другое имя.");
          return;
        }

        // Если имя уникально, обновляем
        const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
        await update(userDatabaseRef, { username: newUsername });
        setUsername(newUsername);
        setIsEditingUsername(false);
        showNotification(`Имя изменено на "${newUsername}"`);
      } catch (error) {
        console.error("Ошибка при изменении имени пользователя:", error);
      }
    } else {
      showNotificationError("Имя пользователя может содержать только буквы, цифры, нижнее подчеркивание и точку.");
    }
  };

  const handleAboutMeChange = async () => {
    if (authUser) {
      const aboutText = newAboutMe.trim() === "" ? "Напишите немного о себе" : newAboutMe;
      try {
        const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
        await update(userDatabaseRef, { aboutMe: aboutText });
        setAboutMe(aboutText);
        setIsEditingAboutMe(false);
        showNotification(`Информация "О себе" обновлена`);
      } catch (error) {
        console.error("Ошибка при изменении информации 'О себе':", error);
      }
    }
  };

  const userSignOut = () => {
    const userRef = databaseRef(database, 'users/' + authUser.uid);
    update(userRef, { status: "offline", lastActive: new Date().toLocaleString() }).then(() => {
      signOut(auth).then(() => console.log("Successfully signed out!")).catch((e) => console.log(e));
    });
  };

  const renderStatus = () => {
    if (status === "online") {
      return <span className="status-online">в сети</span>;
    } else {
      return <span className="status-offline">был(а) недавно: {lastActive}</span>;
    }
  };

  return (
    <div className="profile-container">
       <div className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </div>
      {authUser ? (
        <div className="profile-content">
          {notification && (
            <div className={`notification ${notificationType}`}>
              {notification}
            </div>
         )} {/* Уведомление */}

          <div className="profile-header">
            <div className="avatar-section">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="avatar"
                onClick={() => setIsAvatarModalOpen(true)}
              />
              <label htmlFor="avatarInput" className="avatar-upload-btn">Загрузить фото</label>
              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="username-section">
              <h2>{username}</h2>
              <p>{renderStatus()}</p>
            </div>

            <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
              <FaEllipsisV />
            </div>

            {showMenu && (
              <div className="menu-dropdown" ref={menuRef}>
                <button onClick={() => document.getElementById('avatarInput').click()}>Добавить фото профиля</button>
                <button onClick={deleteAvatar}>Удалить фото профиля</button>
                <button onClick={() => setIsEditingUsername(true)}>Изменить имя пользователя</button>
              </div>
            )}
          </div>

          {isEditingUsername && (
            <div className="edit-username-section">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Новое имя пользователя"
              />
              <button onClick={handleUsernameChange}>Изменить</button>
              <FaTimes className="close-icon" onClick={() => setIsEditingUsername(false)} /> {/* Кнопка крестика */}
            </div>
          )}

          <div className="profile-info">
            <div className="info-section">
              <h3>Аккаунт</h3>
              <p>{phoneNumber}</p>
            </div>

            <div className="info-section">
              <h3 onClick={() => setIsEditingAboutMe(true)}>О себе</h3> {/* Открыть редактирование */}
              <p>{aboutMe}</p>
            </div>

            {isEditingAboutMe && (
              <div className="edit-aboutme-section">
                <textarea
                  type="text"
                  value={newAboutMe}
                  onChange={(e) => setNewAboutMe(e.target.value)}
                  placeholder="Расскажите о себе"
                />
                <button onClick={handleAboutMeChange}>Сохранить</button>
                <FaTimes className="close-icon" onClick={() => setIsEditingAboutMe(false)} /> {/* Кнопка крестика */}
              </div>
            )}

            <div className="info-section">
              <h3>Конфиденциальность</h3>
              <p>{email}</p>
            </div>

            <div className="settings">
              <h3>Настройки</h3>
              <ul>
                <li>Настройки чатов</li>
                <li>Конфиденциальность</li>
                <li>Уведомления и звуки</li>
                <li>Данные и память</li>
                <li>Устройства</li>
                <li>Язык</li>
              </ul>
            </div>
          </div>

          <button className="signout-btn" onClick={userSignOut}>Выйти из аккаунта</button>

          {isAvatarModalOpen && (
            <div className="avatar-modal" onClick={() => setIsAvatarModalOpen(false)}>
              <div className="avatar-overlay">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="full-size-avatar"
                  onClick={() => setIsAvatarModalOpen(false)}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="signed-out">
          <p>Вы вышли из аккаунта</p>
          <Link className="authoutlink" to="/">Войти в аккаунт</Link>
        </div>
      )}
    </div>
  );
};

export default AuthDetails;





// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"; // Добавил deleteObject для удаления
// import { ref as databaseRef, onValue, update } from "firebase/database";
// import React, { useEffect, useState } from "react";
// import { auth, database, storage } from "../../firebase"; // Правильные экспорты
// import { Link } from "react-router-dom";

// const AuthDetails = () => {
//   const [authUser, setAuthUser] = useState(null);
//   const [username, setUsername] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [email, setEmail] = useState("");
//   const [status, setStatus] = useState("offline");
//   const [lastActive, setLastActive] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState("/default-avatar.png"); // Default avatar URL
//   const [showFullImage, setShowFullImage] = useState(false); // Для показа фото в полном размере
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Для показа окна подтверждения удаления
//   const [isHolding, setIsHolding] = useState(false); // Для отслеживания долгого нажатия

//   useEffect(() => {
//     const listen = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setAuthUser(user);
//         setEmail(user.email);

//         // Получаем информацию о пользователе из Realtime Database
//         const userRef = databaseRef(database, 'users/' + user.uid);
//         onValue(userRef, (snapshot) => {
//           const data = snapshot.val();
//           if (data) {
//             setUsername(data.username || "User");
//             setPhoneNumber(data.phoneNumber || "+Введите номер телефона");
//             setStatus(data.status || "offline");
//             setLastActive(data.lastActive || "");
//             setAvatarUrl(data.avatarUrl || "/default-avatar.png"); // Set avatar URL from DB
//           }
//         });

//         // Устанавливаем статус "online"
//         update(userRef, { status: "online" });

//         // Обновляем статус на "offline" при закрытии окна
//         window.addEventListener('beforeunload', () => {
//           update(userRef, { status: "offline", lastActive: new Date().toLocaleString() });
//         });
//       } else {
//         setAuthUser(null);
//         setUsername("");
//         setEmail("");
//         setPhoneNumber("");
//         setStatus("offline");
//         setLastActive("");
//         setAvatarUrl("/default-avatar.png");
//       }
//     });

//     return () => {
//       listen();
//       window.removeEventListener('beforeunload', () => {}); // Очистка
//     };
//   }, []);

//   // Функция для загрузки нового аватара
//   const handleAvatarChange = async (e) => {
//     const file = e.target.files[0];
//     if (file && authUser) {
//       try {
//         const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`); // Ref for storage

//         // Загрузка файла в Firebase Storage
//         const snapshot = await uploadBytes(avatarStorageRef, file);

//         // Получение URL загруженного изображения
//         const downloadURL = await getDownloadURL(avatarStorageRef);
//         setAvatarUrl(downloadURL); // Обновляем URL аватара локально

//         // Обновляем данные в Realtime Database
//         const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
//         await update(userDatabaseRef, { avatarUrl: downloadURL });

//         console.log('Avatar updated successfully!');
//       } catch (error) {
//         console.error("Ошибка при загрузке изображения:", error);
//       }
//     }
//   };

//   // Функция для удаления аватара
//   const deleteAvatar = async () => {
//     if (authUser) {
//       try {
//         const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`);
//         await deleteObject(avatarStorageRef); // Удаление файла из Firebase Storage

//         // Обновляем аватар в базе данных на значение по умолчанию
//         const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
//         await update(userDatabaseRef, { avatarUrl: "/default-avatar.png" });

//         setAvatarUrl("/default-avatar.png"); // Обновляем аватар локально
//         setShowDeleteConfirm(false); // Закрываем окно подтверждения
//         console.log('Avatar deleted successfully!');
//       } catch (error) {
//         console.error("Ошибка при удалении изображения:", error);
//       }
//     }
//   };

//   // Обработка клика на аватар для показа полного изображения
//   const handleAvatarClick = () => {
//     setShowFullImage(true);
//   };

//   // Обработка длительного нажатия (3 секунды) на аватар
//   const handleAvatarHold = () => {
//     setIsHolding(true);
//     setTimeout(() => {
//       if (isHolding) {
//         setShowDeleteConfirm(true); // Показать окно подтверждения удаления
//       }
//     }, 3000); // 3 секунды
//   };

//   const handleAvatarRelease = () => {
//     setIsHolding(false);
//   };

//   function userSignOut() {
//     const userRef = databaseRef(database, 'users/' + authUser.uid);
//     update(userRef, { status: "offline", lastActive: new Date().toLocaleString() }).then(() => {
//       signOut(auth)
//         .then(() => console.log("Successfully signed out!"))
//         .catch((e) => console.log(e));
//     });
//   }

//   const renderStatus = () => {
//     if (status === "online") {
//       return <span className="status-online">в сети</span>;
//     } else {
//       return <span className="status-offline">был(а) недавно: {lastActive}</span>;
//     }
//   };

//   return (
//     <div className="profile-container">
//       {authUser ? (
//         <div className="profile-content">
//           <div className="profile-header">
//             <div className="avatar-section">
//               <img
//                 src={avatarUrl}
//                 alt="Avatar"
//                 className="avatar"
//                 onClick={handleAvatarClick} // Клик для показа полного размера
//                 onMouseDown={handleAvatarHold} // Удержание мыши для удаления
//                 onMouseUp={handleAvatarRelease} // Отпускание мыши
//               />
//               <label htmlFor="avatarInput" className="avatar-upload-btn">
//                 Загрузить фото
//               </label>
//               <input
//                 type="file"
//                 id="avatarInput"
//                 accept="image/*"
//                 onChange={handleAvatarChange}
//                 style={{ display: 'none' }}
//               />
//             </div>
//             <div className="username-section">
//               <h2>{username}</h2>
//               <p>{renderStatus()}</p>
//             </div>
//           </div>

//           <div className="profile-info">
//             <div className="info-section">
//               <h3>Аккаунт</h3>
//               <p>{phoneNumber}</p>
//             </div>

//             <div className="info-section">
//               <h3>О себе</h3>
//               <p>Напишите немного о себе</p>
//             </div>

//             <div className="info-section">
//               <h3>Конфиденциальность</h3>
//               <p>{email}</p>
//             </div>

//             <div className="settings">
//               <h3>Настройки</h3>
//               <ul>
//                 <li>Настройки чатов</li>
//                 <li>Конфиденциальность</li>
//                 <li>Уведомления и звуки</li>
//                 <li>Данные и память</li>
//                 <li>Устройства</li>
//                 <li>Язык</li>
//               </ul>
//             </div>
//           </div>

//           <button className="signout-btn" onClick={userSignOut}>
//             Выйти из аккаунта
//           </button>

//           {/* Модальное окно для полного размера изображения */}
//           {showFullImage && (
//             <div className="modal" onClick={() => setShowFullImage(false)}>
//               <img src={avatarUrl} alt="Full Size Avatar" className="full-size-avatar" />
//             </div>
//           )}

//           {/* Модальное окно для подтверждения удаления аватара */}
//           {showDeleteConfirm && (
//             <div className="modal-confirm">
//               <p>Удалить аватарку?</p>
//               <button onClick={deleteAvatar}>Да</button>
//               <button onClick={() => setShowDeleteConfirm(false)}>Нет</button>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="signed-out">
//           <p>Вы вышли из аккаунта</p>
//           <Link className="authoutlink" to="/">Войти в аккаунт</Link>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AuthDetails;















// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { ref, onValue } from "firebase/database";
// import React, { useEffect, useState } from "react";
// import { auth, database } from "../../firebase";
// import { Link } from "react-router-dom";

// const AuthDetails = () => {
//   const [authUser, setAuthUser] = useState(null);
//   const [username, setUsername] = useState("");

//   useEffect(() => {
//     const listen = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setAuthUser(user);
//         // Получаем имя пользователя из Realtime Database
//         const userRef = ref(database, 'users/' + user.uid);
//         onValue(userRef, (snapshot) => {
//           const data = snapshot.val();
//           if (data) {
//             setUsername(data.username || "User");
//           } else {
//             setUsername("User");
//           }
//         });
//       } else {
//         setAuthUser(null);
//         setUsername("");
//       }
//     });

//     return () => {
//       listen();
//     };
//   }, []);

//   function userSignOut() {
//     signOut(auth)
//       .then(() => console.log("Successfully signed out!"))
//       .catch((e) => console.log(e));
//   }

//   return (
//     <div className="bodyauth">
//       {authUser ? (
//         <div className="profile">
//           <p>{`Signed in as ${username} (${authUser.email})`}</p>
//           <button onClick={userSignOut}>Sign Out</button>
//         </div>
//       ) : (
//            <p className="authout">
//              Signed Out
//             <Link className="authoutlink" to="/">Войти в аккаунт</Link>
//            </p>      
//                 )}
//     </div>
//   );
// };

// export default AuthDetails;