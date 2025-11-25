import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
    const navigate = useNavigate();

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left" onClick={() => navigate("/")}>
                    CoRunning
                </div>

                <nav className="header-menu">
                    <span onClick={() => navigate("/routes")}>Run routes</span>
                    <span onClick={() => navigate("/crew")}>Crew Finder</span>
                    <span onClick={() => navigate("/log")}>Run Log</span>
                    <span onClick={() => navigate("/mypage")}>My Page</span>
                </nav>

                
                <button className="login-btn" onClick={() => navigate("/login")}>
                    로그인
                </button>
            </div>
        </header>
    );
}

export default Header;