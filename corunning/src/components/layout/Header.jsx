import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Global.css";
import "./Header.css";
import logoImg from "../../assets/images/logo.png";

function Header() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const loginState = sessionStorage.getItem("isLogin");
      setIsLogin(loginState === "true");
    };

    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("isLogin");
    sessionStorage.removeItem("userEmail");
    window.dispatchEvent(new Event("storage"));
    
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-inner">

        {/* 로고 */}
        <div className="logo" onClick={() => navigate("/")}>
          <img src={logoImg} alt="coRunning Logo" />
        </div>

        {/* 네비게이션 */}
        <nav className="nav">
          <Link to="/routes" onClick={() => window.scrollTo(0, 0)}>Run Routes</Link>
          <Link to="/crews" onClick={() => window.scrollTo(0, 0)}>Crew Finder</Link>
          <Link to="/runlog" onClick={() => window.scrollTo(0, 0)}>Run Log</Link>
          <Link to="/mypage" onClick={() => window.scrollTo(0, 0)}>My Page</Link>
        </nav>

        {/* 로그인 / 회원가입 / 로그아웃 */}
        <div className="auth-area">
          {!isLogin ? (
            <>
              <button
                className="login-btn"
                onClick={() => navigate("/login")}
              >
                로그인
              </button>

              <button
                className="signup-btn"
                onClick={() => navigate("/signup")}
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              <button className="logout-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;
