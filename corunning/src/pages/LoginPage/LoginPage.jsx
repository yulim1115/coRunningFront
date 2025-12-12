import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { getMyInfo, loginAPI } from "../../api/userApi";

const showSuccess = (msg) => {
  window.Swal.fire({
    icon: "success",
    title: "성공",
    text: msg,
    confirmButtonColor: "#0f1c2e",
  });
};

const showError = (msg) => {
  window.Swal.fire({
    icon: "error",
    title: "오류",
    text: msg,
    confirmButtonColor: "#0f1c2e",
  });
};

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.backgroundColor = "var(--color-bg-light)";
    return () => {
      document.body.style.backgroundColor = "var(--color-bg)";
    };
  }, []);

  // 로그인 상태 확인
  useEffect(() => {
    const isLogin = sessionStorage.getItem("isLogin") === "true";
    if (isLogin) {
      showError("이미 로그인된 상태입니다.");
      navigate("/");
    }
  }, [navigate]);

  // 입력값 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 로그인 요청
  const handleLogin = async (e) => {
    e.preventDefault();

    const data = {
      userId: email,
      userPw: password,
    };

    try {
      await loginAPI(data);
      const userdata = await getMyInfo();

      sessionStorage.setItem("isLogin", "true");
      sessionStorage.setItem("userEmail", userdata.data.userId);
      sessionStorage.setItem("userName", userdata.data.userName);

      window.dispatchEvent(new Event("storage"));
      showSuccess("로그인 성공!");
      navigate("/");
    } catch (err) {
      console.error(err);
      showError("로그인 실패! 아이디 또는 비밀번호를 확인하세요.");
    }
  };

  // 페이지 진입 시 화면 상단
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <h2 className="login-title">Sign In</h2>
        <p className="login-sub">함께 달리는 경험을 이어가는 순간</p>

        {/* 입력폼 */}
        <form onSubmit={handleLogin} className="login-form">
          {/* 이메일 */}
          <div className="form-group">
            <label className="form-label">이메일 (ID)</label>
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
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* 로그인 버튼 */}
          <button type="submit" className="btn btn-main btn-large login-btn">
            로그인
          </button>
        </form>

        {/* 회원가입 안내 */}
        <p className="signup-guide">
          아직 회원이 아니신가요?
          <span className="link-text" onClick={() => navigate("/signup")}>
            회원가입
          </span><br/>
          비밀번호를 잊으셨나요?
          <span className="link-text" onClick={() => navigate("/pwreset")}>
            비밀번호 재설정
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
