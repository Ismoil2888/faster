import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { Link } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline, IoMailOutline } from "react-icons/io5";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Состояние для показа/скрытия пароля

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const logIn = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential);
        setError("");
        setEmail("");
        setPassword("");
        window.location.href = "#/authdetails"; // Перенаправление после успешного входа
      })
      .catch((error) => {
        console.log(error);
        setError("Account not found or incorrect password!");
      });
  };

  return (
    <div className="section">
      <div className="login-box">
        <form onSubmit={logIn}>
          <h2>Login</h2>
          <div className="input-box">
            <span className="icon">
              <IoMailOutline /> {/* Иконка email */}
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Email</label>
          </div>
          <div className="input-box">
            <span className="icon" onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
              {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />} {/* Переключение иконки */}
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"} // Переключение типа input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
          </div>
          <div className="remember-forgot">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <p>Forgot Password?</p>
          </div>
          <button type="submit">Login</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div className="register-link">
            <p>
              Don't have an account? <Link className="a" to="/signup">Register</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;


// import { signInWithEmailAndPassword } from "firebase/auth";
// import React, { useState } from "react";
// import { auth } from "../../firebase";
// import { Link } from "react-router-dom";

// const SingIn = () => {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");

//     function logIn(e) {
//         e.preventDefault();
 
//         signInWithEmailAndPassword(auth, email, password)
//         .then((user) => {
//             console.log(user);
//             setError("");
//             setEmail("");
//             setPassword("");
//             window.location.href = "/authdetails"; // Перенаправление после успешного входа
//         })
//         .catch((error) => {
//             console.log(error);
//             setError("Аккаунт не найден!");
//         });
//     }

//     return (
      
//         <div>
//             <form className="loginblock2" onSubmit={logIn}>
//                 <h2>Login</h2>
//                 <input 
//                     value={email} 
//                     onChange={(e) => setEmail(e.target.value)} 
//                     type="email" 
//                     placeholder="Email" 
//                 />
//                 <input 
//                     value={password} 
//                     onChange={(e) => setPassword(e.target.value)} 
//                     type="password" 
//                     placeholder="Password" 
//                 />
//                 <button type="submit">Login</button>
//                 {error && <p style={{ color: "red" }}>{error}</p>}
//                 <p>
//                     Нет аккаунта?{" "}
//                     <Link to="/signup">зарегистрируйся</Link>
//                 </p>
//             </form>
//         </div>
//     );
// };

// export default SingIn;



// import { signInWithEmailAndPassword } from "firebase/auth";
// import React, { useState } from "react";
// import { auth } from "../../firebase";

// const SignIn = () => {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [CopyPassword, setCopyPassword] = useState("");
//     const [error, setError] = useState("");
//     function logIn(e) {
//         e.preventDefault();
 
//         signInWithEmailAndPassword(auth, email, password)
//         .then((user) => {
//             console.log(user);
//             setError("");
//             setEmail("");
//             setPassword("");
//         })
//         .catch((error) => {
//              console.log(error);
//              setError("Аккаунт не найден!")
//         });
//     }

//     return (
//         <div>
//         <form className="loginblock2">
//             <h2>Login</h2>
//           <input 
//           value={email} 
//           onChange={(e) => setEmail(e.target.value)} 
//           type="email" placeholder='email' />
//           <input 
//           value={password} 
//           onChange={(e) => setPassword(e.target.value)} 
//           type="password" placeholder='password' />
//           <button onClick={logIn}>Login</button>
//           {error ? <p style={{color: "red"}}>{error}</p> : ""}
//         </form>
//       </div>
//     );
// }

// export default SignIn;