import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { Link } from "react-router-dom";

const AuthDetails = () => {
    const [authUser, setAuthUser] = useState(null);

    useEffect(() => {
        const listen = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthUser(user);
            } else {
                setAuthUser(null);
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
        <div>
            {authUser ? (
                <div className="profile">
                    <p>{`Signed in as ${authUser.displayName} (${authUser.email})`}</p>
                    <button onClick={userSignOut}>Sign Out</button>
                </div>
            ) : (
                <p>Signed Out
                     <Link to="/">Войти в аккаунт</Link>
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
//     const [authUser, setAuthUset]=useState(null)
//     useEffect(() => {
//         const listen = onAuthStateChanged(auth, (user) => {
//             if (user) {
//                 setAuthUset(user);
//             } else {
//                 setAuthUset(null);
//             }
//         });
//         return () => {
//             listen();
//         };
//     }, []);
//         function userSignOut() {
//             signOut(auth)
//             .then(() => console.log("успешно!"))
//             .catch((e) => console.log(e));
//         }
//         return (
//         <div>
//             {authUser ? (
//                 <div className="profile">
//                     <p>{`Signid in as ${authUser.email}`}</p>
//                     <button onClick={userSignOut}>Sign Out</button>
//                 </div>
//             ) : (
//             <p>Signed Out
//              <Link to="/">Войти</Link>
//             </p>
//         )}
//         </div>
//     );
// };

// export default AuthDetails