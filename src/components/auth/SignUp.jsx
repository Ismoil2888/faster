import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import { Link } from "react-router-dom";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const register = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        updateProfile(user, { displayName: name })
          .then(() => {
            console.log("User profile updated with name:", name);
            // Clear fields after successful registration
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setError("");
            window.location.href = "/authdetails"; // Redirect after successful registration
          })
          .catch((error) => {
            console.error("Error updating profile:", error);
            setError("Failed to update user profile");
          });
      })
      .catch((error) => {
        console.error("Error creating user:", error);
        setError("Registration failed");
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
            name="user_name"
            id="user_name"
            maxLength="8"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          Already have an account? <Link to="/">Login</Link>
        </p>
        </div>
      </form>
    </div>
    </div>
  );
};

export default SignUp;


// import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
// import React, { useState } from "react";
// import { auth } from "../../firebase";

// const SignUp = () => {
//   const [username, setUsername] = useState(""); // Добавляем состояние для имени пользователя
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [CopyPassword, setCopyPassword] = useState("");
//   const [error, setError] = useState("");

//   function register(e) {
//     e.preventDefault();

//     if (CopyPassword !== password) {
//       setError("Passwords don't match");
//       return;
//     }

//     createUserWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         const user = userCredential.user;

//         // Обновляем профиль пользователя, добавляем имя пользователя
//         updateProfile(user, {
//           displayName: username,
//         }).then(() => {
//           console.log("User profile updated successfully!");
//           window.location.href = "/authdetails"; // Перенаправляем после регистрации
//         }).catch((error) => {
//           setError(error.message);
//         });
//       })
//       .catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;

//         if (errorCode === "auth/email-already-in-use") {
//           setError("This email is already registered!");
//         } else {
//           setError(errorMessage);
//         }
//       });
//   }

//   return (
//     <div>
//       <form onSubmit={register} className="loginblock">
//         <h2>Registration</h2>
//         <input
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           type="text"
//           placeholder="Username"
//         />
//         <input
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           type="email"
//           placeholder="Email"
//         />
//         <input
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           type="password"
//           placeholder="Password"
//         />
//         <input
//           value={CopyPassword}
//           onChange={(e) => setCopyPassword(e.target.value)}
//           type="password"
//           placeholder="Confirm Password"
//         />
//         <button type="submit">Create</button>
//         {error && (
//           <p style={{ color: "red" }}>{error}</p>
//         )}
//       </form>
//     </div>
//   );
// };

// export default SignUp;


// import { createUserWithEmailAndPassword } from "firebase/auth";
// import React, { useState } from "react";
// import { auth } from "../../firebase";
// import { Link } from "react-router-dom";

// const SignUp = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [CopyPassword, setCopyPassword] = useState("");
//   const [error, setError] = useState("");

//   function register(e) {
//     e.preventDefault();

//     if (CopyPassword !== password) {
//       setError("Password didn't match");
//       return;
//     }

//     createUserWithEmailAndPassword(auth, email, password)
//       .then((user) => {
//         console.log(user);
//         setError(""); 
//         setEmail(""); 
//         setPassword(""); 
//         setCopyPassword(""); 
//         window.location.href = "/authdetails"; // Перенаправление после успешной регистрации
//       })
//       .catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;

//         if (errorCode === "auth/email-already-in-use") {
//           setError("This email is already registered!");
//         } else {
//           setError(errorMessage);
//         }
//       });
//   }

//   return (
//     <div>
//       <form onSubmit={register} className="loginblock">
//         <h2>Registration</h2>
//         <input
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           type="email"
//           placeholder="Email"
//         />
//         <input
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           type="password"
//           placeholder="Password"
//         />
//         <input
//           value={CopyPassword}
//           onChange={(e) => setCopyPassword(e.target.value)}
//           type="password"
//           placeholder="Confirm Password"
//         />
//         <button type="submit">Create</button>
//         {error && (
//           <p style={{ color: "red" }}>{error}</p>
//         )}

//         <p> 
//           <Link to="/">Уже есть аккаунт</Link>
//         </p>

//       </form>
//     </div>
//   );
// };

// export default SignUp;


// import { createUserWithEmailAndPassword } from "firebase/auth";
// import React, { useState } from "react";
// import { auth } from "../../firebase";

// const SignUp = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [CopyPassword, setCopyPassword] = useState("");
//   const [error, setError] = useState("");

//   function register(e) {
//     e.preventDefault();

//     if (CopyPassword !== password) {
//       setError("Password didn't match");
//       return;
//     }

//     createUserWithEmailAndPassword(auth, email, password)
//       .then((user) => {
//         console.log(user);
//         setError(""); // Clear error message
//         setEmail(""); // Clear email field
//         setPassword(""); // Clear password field
//         setCopyPassword(""); // Clear confirm password field
//         // Handle successful registration (optional: redirect to login)
//       })
//       .catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;

//         if (errorCode === "auth/email-already-in-use") {
//           setError("This email is already registered!");
//         } else {
//           // Handle other errors (e.g., network issues)
//           setError(errorMessage);
//         }
//       });
//   }

//   return (
//     <div>
//       <form onSubmit={register} className="loginblock">
//         <h2>Registration</h2>
//         <input
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           type="email"
//           placeholder="Email"
//         />
//         <input
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           type="password"
//           placeholder="Password"
//         />
//         <input
//           value={CopyPassword}
//           onChange={(e) => setCopyPassword(e.target.value)}
//           type="password"
//           placeholder="Confirm Password"
//         />
//         <button>Create</button>
//         {error && (
//           <p style={{ color: "red" }}>{error}</p>
//         )}
//       </form>
//     </div>
//   );
// };

// export default SignUp;