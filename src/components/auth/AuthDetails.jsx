import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"; // Добавил deleteObject для удаления
import { ref as databaseRef, onValue, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { auth, database, storage } from "../../firebase"; // Правильные экспорты
import { Link } from "react-router-dom";
import { FaEllipsisV } from "react-icons/fa"; // Иконка для меню

const AuthDetails = () => {
  const [authUser, setAuthUser] = useState(null);
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("offline");
  const [lastActive, setLastActive] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/default-image.png"); // Default avatar URL
  const [showMenu, setShowMenu] = useState(false); // Для показа меню
  const [newUsername, setNewUsername] = useState(""); // Для изменения имени пользователя
  const [isEditingUsername, setIsEditingUsername] = useState(false); // Режим редактирования имени

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        setEmail(user.email);

        // Получаем информацию о пользователе из Realtime Database
        const userRef = databaseRef(database, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUsername(data.username || "User");
            setPhoneNumber(data.phoneNumber || "+Введите номер телефона");
            setStatus(data.status || "offline");
            setLastActive(data.lastActive || "");
            setAvatarUrl(data.avatarUrl || "/default-image.png"); // Set avatar URL from DB
          }
        });

        // Устанавливаем статус "online"
        update(userRef, { status: "online" });

        // Обновляем статус на "offline" при закрытии окна
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
        setAvatarUrl("/default-image.png");
      }
    });

    return () => {
      listen();
      window.removeEventListener('beforeunload', () => {}); // Очистка
    };
  }, []);

  // Функция для загрузки нового аватара
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file && authUser) {
      try {
        const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`); // Ref for storage

        // Загрузка файла в Firebase Storage
        const snapshot = await uploadBytes(avatarStorageRef, file);

        // Получение URL загруженного изображения
        const downloadURL = await getDownloadURL(avatarStorageRef);
        setAvatarUrl(downloadURL); // Обновляем URL аватара локально

        // Обновляем данные в Realtime Database
        const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
        await update(userDatabaseRef, { avatarUrl: downloadURL });

        console.log('Avatar updated successfully!');
      } catch (error) {
        console.error("Ошибка при загрузке изображения:", error);
      }
    }
  };

  // Функция для удаления аватара
  const deleteAvatar = async () => {
    if (authUser) {
      try {
        const avatarStorageRef = storageRef(storage, `avatars/${authUser.uid}`);
        await deleteObject(avatarStorageRef); // Удаление файла из Firebase Storage

        // Обновляем аватар в базе данных на значение по умолчанию
        const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
        await update(userDatabaseRef, { avatarUrl: "/default-image.png" });

        setAvatarUrl("/default-image.png"); // Обновляем аватар локально
        setShowMenu(false); // Закрываем меню
        console.log('Avatar deleted successfully!');
      } catch (error) {
        console.error("Ошибка при удалении изображения:", error);
      }
    }
  };

  // Функция для изменения имени пользователя
  const handleUsernameChange = async () => {
    if (authUser && newUsername.trim() !== "") {
      try {
        const userDatabaseRef = databaseRef(database, 'users/' + authUser.uid);
        await update(userDatabaseRef, { username: newUsername });
        setUsername(newUsername);
        setIsEditingUsername(false); // Выход из режима редактирования
        setShowMenu(false); // Закрываем меню
        console.log("Username updated successfully!");
      } catch (error) {
        console.error("Ошибка при изменении имени пользователя:", error);
      }
    }
  };

  function userSignOut() {
    const userRef = databaseRef(database, 'users/' + authUser.uid);
    update(userRef, { status: "offline", lastActive: new Date().toLocaleString() }).then(() => {
      signOut(auth)
        .then(() => console.log("Successfully signed out!"))
        .catch((e) => console.log(e));
    });
  }

  const renderStatus = () => {
    if (status === "online") {
      return <span className="status-online">в сети</span>;
    } else {
      return <span className="status-offline">был(а) недавно: {lastActive}</span>;
    }
  };

  return (
    <div className="profile-container">
      {authUser ? (
        <div className="profile-content">
          <div className="profile-header">
            <div className="avatar-section">
              <img src={avatarUrl} alt="Avatar" className="avatar" />
              <label htmlFor="avatarInput" className="avatar-upload-btn">
                Загрузить фото
              </label>
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

            {/* Меню с тремя точками */}
            <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
              <FaEllipsisV />
            </div>

            {showMenu && (
              <div className="menu-dropdown">
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
            </div>
          )}

          <div className="profile-info">
            <div className="info-section">
              <h3>Аккаунт</h3>
              <p>{phoneNumber}</p>
            </div>

            <div className="info-section">
              <h3>О себе</h3>
              <p>Напишите немного о себе</p>
            </div>

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

          <button className="signout-btn" onClick={userSignOut}>
            Выйти из аккаунта
          </button>
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