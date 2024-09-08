import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import React, { useEffect, useState } from "react";
import { auth, database } from "../../firebase";
import { Link } from "react-router-dom";

const AuthDetails = () => {
  const [authUser, setAuthUser] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        // Получаем имя пользователя из Realtime Database
        const userRef = ref(database, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUsername(data.username || "User");
          } else {
            setUsername("User");
          }
        });
      } else {
        setAuthUser(null);
        setUsername("");
      }
    });

    return () => {
      listen();
    };
  }, []);

  function userSignOut() {
    signOut(auth)
      .then(() => console.log("Successfully signed out!"))
      .catch((e) => console.log(e));
  }

  return (
    <div className="bodyauth">
      {authUser ? (
        <div className="profile">
          <p>{`Signed in as ${username} (${authUser.email})`}</p>
          <button onClick={userSignOut}>Sign Out</button>
        </div>
      ) : (
           <p className="authout">
             Signed Out
            <Link className="authoutlink" to="/faster">Войти в аккаунт</Link>
           </p>      
                )}
    </div>
  );
};

export default AuthDetails;




// import { onAuthStateChanged, signOut } from "firebase/auth";
// import React, { useEffect, useState } from "react";
// import { auth } from "../../firebase";
// import { Link } from "react-router-dom";

// const AuthDetails = () => {
//     const [authUser, setAuthUser] = useState(null);

//     useEffect(() => {
//         const listen = onAuthStateChanged(auth, (user) => {
//             if (user) {
//                 setAuthUser(user);
//             } else {
//                 setAuthUser(null);
//             }
//         });
//         return () => {
//             listen();
//         };
//     }, []);

//     function userSignOut() {
//         signOut(auth)
//         .then(() => console.log("Successfully signed out!"))
//         .catch((e) => console.log(e));
//     }

//     return (
//         <div>
//             {authUser ? (
//                 <div className="profile">
//                     <p>{`Signed in as ${authUser.displayName} (${authUser.email})`}</p>
//                     <button onClick={userSignOut}>Sign Out</button>
//                 </div>
//             ) : (
//                 <p>Signed Out
//                      <Link to="/">Войти в аккаунт</Link>
//                 </p>
//             )}
//         </div>
//     );
// };

// export default AuthDetails;