import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import Header from "./components/Header";


function App(){
  return (
    <Router>
      <Header/>

      <Routes>
        {/* 기본 페이지 -> 로그인 */}
        <Route path="/" element={<Login/>}/>

        {/* 로그인 */}
        <Route path="/login" element={<Login/>}/>

        {/* 회원가입 */}
        <Route path="/signup" element={<SignUp/>}/>
      </Routes>
    </Router>
  );
}

export default App;