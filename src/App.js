import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import './Registration.css';
import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import AuthDetails from './components/auth/AuthDetails';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/iamfirst" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/authdetails" element={<AuthDetails />} />
        </Routes>
      </div>
    </Router>
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