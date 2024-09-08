import { Routes, Route } from "react-router-dom";
import './App.css';
import './Registration.css';
import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import AuthDetails from './components/auth/AuthDetails';
import NotfoundPage from "./components/NotfoundPage";

function App() {
  return (
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/authdetails" element={<AuthDetails />} />
          <Route path="*" element={<NotfoundPage />} />
        </Routes>
  );
}

export default App;