// src/pages/LoginPage/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { getMyInfo, loginAPI } from "../../api/userApi";

function LoginPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const isLogin = sessionStorage.getItem("isLogin") === "true";
    if (isLogin) {
      alert("이미 로그인된 상태입니다.");
      navigate("/");
    }
  }, [navigate]);
  /* 입력값 상태 */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* 로그인 요청 */
  const handleLogin = async (e) => {
    e.preventDefault();

    const data = {
      userId: email,
      userPw: password,
    };

    try {
      await loginAPI(data);
      const userdata = await getMyInfo();
      console.log("로그인 사용자 정보:", userdata);
      /* 로그인 상태 저장 */
      sessionStorage.setItem("isLogin", "true");
      sessionStorage.setItem("userEmail", userdata.data.userId);
      sessionStorage.setItem("userName", userdata.data.userName);
      console.log(sessionStorage.getItem("userName"));

      /* 헤더 강제 업데이트 */
      window.dispatchEvent(new Event("storage"));

      alert("로그인 성공!");
      navigate("/");

    } catch (err) {
      console.error(err);
      alert("로그인 실패! 아이디 또는 비밀번호를 확인하세요.");
    }
  };

  // 화면 진입 시 스크롤 맨 위
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>로그인</h2>

        <form onSubmit={handleLogin}>

          {/* 이메일 */}
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

          {/* 비밀번호 */}
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

          {/* 로그인 버튼 */}
          <button type="submit" className="login-submit-btn">
            로그인
          </button>

        </form>

        {/* 회원가입 안내 */}
        <p className="signup-guide">
          아직 회원이 아니신가요?
          <span className="link-text" onClick={() => navigate("/signup")}>
            회원가입
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
