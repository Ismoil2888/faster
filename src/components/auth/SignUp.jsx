import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import React, { useState } from "react";
import { auth, database } from "../../firebase";  // Обязательно импортируйте и database
import { Link } from "react-router-dom";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copyPassword, setCopyPassword] = useState("");
  const [error, setError] = useState("");

  const register = (e) => {
    e.preventDefault();

    if (copyPassword !== password) {
      setError("Passwords do not match");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Сохраняем имя пользователя в Realtime Database
        set(ref(database, 'users/' + user.uid), {
          username: username,
          email: user.email,
        });

        setError("");
        setEmail("");
        setPassword("");
        setCopyPassword("");
        setUsername("");

        // Перенаправление на AuthDetails после регистрации
        window.location.href = '/authdetails';
      })
      .catch((error) => {
        console.log(error);
        setError("An error occurred during registration");
      });
  };

  return (
    <div className="section">
     <div className="register-box">
       <form onSubmit={register}>
         <h2>Registration</h2>
         <div className="reg-input-box">
           <span className="icon">
             <ion-icon name="person"></ion-icon>
           </span>
           <input
            type="text"
            maxLength="12"
            name="user_name"
            id="user_name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
           />
           <label htmlFor="user_name">Name</label>
         </div>
         <div className="reg-input-box">
           <span className="icon">
             <ion-icon name="mail"></ion-icon>
           </span>
           <input
             type="email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
           />
           <label>Email</label>
         </div>
         <div className="reg-input-box">
           <span className="icon">
             <ion-icon name="lock-closed"></ion-icon>
           </span>
           <input
             type="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
           />
           <label>Password</label>
         </div>
         <div className="reg-input-box">
           <span className="icon">
             <ion-icon name="lock-closed"></ion-icon>
           </span>
           <input
             type="password"
             value={copyPassword}
             onChange={(e) => setCopyPassword(e.target.value)}
           />
           <label>Confirm Password</label>
         </div>
         <div className="remember-forgot">
           <label>
             <input type="checkbox" /> Remember me
           </label>
           <p>Forgot Password?</p>
         </div>
         <button type="submit">Register</button>
         {error && <p style={{ color: "red" }}>{error}</p>}
         <div className="register-link">
         <p>
           Already have an account? 
           <Link className="a" to="/faster">Login</Link>
         </p>
         </div>
       </form>
     </div>
     </div>
  );
};

export default SignUp;




// import React, { useState } from "react";
// import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
// import { auth, database } from "../../firebase";
// import { ref, set } from "firebase/database";
// import { Link } from "react-router-dom";

// const SignUp = () => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");

//   const register = (e) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     createUserWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         const user = userCredential.user;
//         updateProfile(user, { displayName: name })
//           .then(() => {
//             console.log("User profile updated with name:", name);
//             // Сохранение имени в Realtime Database
//             saveUserToDatabase(user.uid, name, email);
//             // Clear fields after successful registration
//             setName("");
//             setEmail("");
//             setPassword("");
//             setConfirmPassword("");
//             setError("");
//             window.location.href = "/authdetails"; // Redirect after successful registration
//           })
//           .catch((error) => {
//             console.error("Error updating profile:", error);
//             setError("Failed to update user profile");
//           });
//       })
//       .catch((error) => {
//         console.error("Error creating user:", error);
//         setError("Registration failed");
//       });
//   };

//     // Функция для сохранения пользователя в Realtime Database
//     const saveUserToDatabase = (uid, name, email) => {
//       set(ref(database, `users/${uid}`), {
//         username: name,
//         email: email,
//       })
//         .then(() => {
//           console.log("User data saved to database");
//         })
//         .catch((error) => {
//           console.error("Error saving user data to database:", error);
//         });
//     };

//   return (
//     <div className="section">
//     <div className="register-box">
//       <form onSubmit={register}>
//         <h2>Registration</h2>
//         <div className="reg-input-box">
//           <span className="icon">
//             <ion-icon name="person"></ion-icon>
//           </span>
//           <input
//             type="text"
//             name="user_name"
//             id="user_name"
//             maxLength="8"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//           />
//           <label htmlFor="user_name">Name</label>
//         </div>
//         <div className="reg-input-box">
//           <span className="icon">
//             <ion-icon name="mail"></ion-icon>
//           </span>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <label>Email</label>
//         </div>
//         <div className="reg-input-box">
//           <span className="icon">
//             <ion-icon name="lock-closed"></ion-icon>
//           </span>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <label>Password</label>
//         </div>
//         <div className="reg-input-box">
//           <span className="icon">
//             <ion-icon name="lock-closed"></ion-icon>
//           </span>
//           <input
//             type="password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//           />
//           <label>Confirm Password</label>
//         </div>
//         <div className="remember-forgot">
//           <label>
//             <input type="checkbox" /> Remember me
//           </label>
//           <p>Forgot Password?</p>
//         </div>
//         <button type="submit">Register</button>
//         {error && <p style={{ color: "red" }}>{error}</p>}
//         <div className="register-link">
//         <p>
//           Already have an account? <Link className="a" to="/">Login</Link>
//         </p>
//         </div>
//       </form>
//     </div>
//     </div>
//   );
// };

// export default SignUp;