import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline, IoMailOutline } from "react-icons/io5";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Состояние для показа/скрытия пароля

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigate = useNavigate();

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
              minLength="6"
              required
            />
            <label htmlFor="password">Password</label>
          </div>
          <div className="remember-forgot">
            <label>
              <input type="checkbox" /> I have read the terms of use
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