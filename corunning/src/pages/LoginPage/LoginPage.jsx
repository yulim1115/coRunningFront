import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Global.css";
import "./LoginPage.css";
import { loginAPI } from "../../api/userApi";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const data = {
      userId: email,
      userPw: password,
    };

    try {
      const res = await loginAPI(data);

      // 자동 로그아웃
      sessionStorage.setItem("isLogin", "true");
      sessionStorage.setItem("userEmail", email);

      // 헤더 즉시 업데이트
      window.dispatchEvent(new Event("storage"));

      alert("로그인 성공!");
      navigate("/");

    } catch (err) {
      console.error(err);
      alert("로그인 실패! 아이디 또는 비밀번호를 확인하세요.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>로그인</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>이메일 (ID)</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-submit-btn">
            로그인
          </button>

          <p className="signup-guide">
            아직 회원이 아니신가요?
            <span className="link-text" onClick={() => navigate("/signup")}>
              회원가입
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
