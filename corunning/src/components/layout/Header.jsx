import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Global.css";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const loginState = sessionStorage.getItem("isLogin"); // ← 변경됨!
      setIsLogin(loginState === "true");
    };

    // 페이지 로딩 시 로그인 상태 즉시 확인
    checkLogin();

    // storage 변화 감지하여 헤더 자동 업데이트
    window.addEventListener("storage", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("isLogin");
    sessionStorage.removeItem("userEmail");

    // 즉시 헤더 업데이트
    window.dispatchEvent(new Event("storage"));

    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-inner">

        {/* 로고 */}
        <div className="logo" onClick={() => navigate("/")}>
          coRunning
        </div>

        {/* 네비게이션 */}
        <nav className="nav">
          <Link to="/routes">Run Routes</Link>
          <Link to="/crews">Crew Finder</Link>
          <Link to="/runlog">Run Log</Link>
          <Link to="/mypage">My Page</Link>
        </nav>

        {/* 로그인/로그아웃 영역 */}
        <div className="auth-area">
          {!isLogin ? (
            <>
              <Link to="/login" className="login-btn">로그인</Link>
              <Link to="/signup" className="signup-btn">회원가입</Link>
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
