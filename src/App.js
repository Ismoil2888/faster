import { Routes, Route } from "react-router-dom";
import './App.css';
import './Registration.css';
import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import AuthDetails from './components/auth/AuthDetails';
import NotfoundPage from './components/NotfoundPage';
import ChatPage from "./components/auth/ChatPage";
import UserProfilePage from "./components/auth/UserProfilePage"; // Импортируем компонент профиля пользователя
import ChatWindow from "./components/auth/ChatWindow";

function App() {
  return (
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/authdetails" element={<AuthDetails />} />
          <Route path="/chatpage" element={<ChatPage />} />
          <Route path="/profile/:userId" element={<UserProfilePage />} />
          <Route path="/chat/:userId" element={<ChatWindow />} />
          <Route path="*" element={<NotfoundPage />} />
        </Routes>
  );
}

export default App;