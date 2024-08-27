import { BrowserRouter, Routes, Route } from "react-router-dom";
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


// import logo from './logo.svg';
// import './App.css';
// import SignUp from './components/auth/SignUp';
// import SignIn from './components/auth/SingIn';
// import AuthDetails from './components/auth/AuthDetails';

// function App() {
//       return (
//      <div className="App">
//       <SignUp/>
//       <SignIn/>
//       <AuthDetails/>
//      </div>
//     );
// }

// export default App;