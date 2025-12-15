// SignUpPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { updatePassword } from "../../api/userApi";
import { FiLoader } from "react-icons/fi";

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

function PwResetPage() {
  const navigate = useNavigate();
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [isPwMatch, setIsPwMatch] = useState(null);
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    document.body.style.backgroundColor = "var(--color-bg-light)";
    return () => {
      document.body.style.backgroundColor = "var(--color-bg)";
    };
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const isLogin = sessionStorage.getItem("isLogin") === "true";
    if (isLogin) {
      showError("이미 로그인된 상태입니다.");
      window.history.back();
    }
  });

  useEffect(() => {
    if (passwordCheck.length > 0) {
      setIsPwMatch(password === passwordCheck);
    } else {
      setIsPwMatch(null);
    }
  }, [password, passwordCheck]);

  const handleSendCode = async () => {
    if (!email) return showError("이메일을 입력해주세요.");

    try {
      const res = await axios.get(`/api/users/check-email?email=${email}`);
      if (res.data === false) {
        showError("가입 되어 있지 않은 이메일입니다.");
        return;
      }
      setLoading(true);
      await axios.post("/api/auth/send-code", { email });
      setLoading(false);
      showSuccess("인증번호가 이메일로 전송되었습니다!");
      setIsCodeSent(true);
      setShowCodeInput(true);
      setTimer(180);
    } catch (err) {
      showError("인증번호 전송 중 오류 발생");
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return showError("인증번호를 입력해주세요.");

    try {
      const res = await axios.post("/api/auth/verify-code", {
        email,
        code: verificationCode,
      });

      if (res.data.valid) {
        showSuccess("인증 완료되었습니다!");
        setIsEmailVerified(true);
        setTimer(0);
      } else {
        showError("인증 실패! 인증번호가 올바르지 않습니다.");
      }
    } catch (err) {
      showError("인증 요청 중 오류 발생");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isEmailVerified) return showError("이메일 인증을 완료해주세요.");

    try {
      await updatePassword(email, password);
      showSuccess("비밀번호 변경 성공!");
      navigate("/login");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "비밀번호 변경 실패!");
    }
  };

  useEffect(() => window.scrollTo(0, 0), []);
  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <h2 className="signup-title">Password Reset</h2>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label className="form-label">
              이메일 (ID) <span className="required">*</span>
            </label>
            <div className="flex-row">
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailVerified(false);
                  setIsCodeSent(false);
                  setShowCodeInput(false);
                }}
                required
              />
              <button
                type="button"
                className="btn btn-accent btn-large"
                onClick={handleSendCode}
                disabled={isEmailVerified}
              >
                {isCodeSent ? "재전송" : "인증번호"}
              </button>
            </div>

            {loading && <div><FiLoader /> &nbsp; 인증번호 전송중입니다.</div>}

            {!loading && showCodeInput && !isEmailVerified && (
              <div className="flex-row" style={{ marginTop: "8px" }}>
                <input
                  type="text"
                  placeholder="인증번호 6자리"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-large btn-outline-accent"
                  onClick={handleVerifyCode}
                >
                  확인
                </button>
              </div>
            )}



            {isEmailVerified && (
              <p className="valid-msg success">✔ 이메일 인증 완료</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              비밀번호 <span className="required">*</span>
            </label>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label className="form-label">
              비밀번호 확인 <span className="required">*</span>
            </label>
            <input
              type="password"
              placeholder="다시 입력"
              value={passwordCheck}
              onChange={(e) => setPasswordCheck(e.target.value)}
              required
            />
            {isPwMatch === false && (
              <p className="valid-msg error">✖ 비밀번호가 일치하지 않습니다</p>
            )}
            {isPwMatch === true && (
              <p className="valid-msg success">✔ 비밀번호가 일치합니다</p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-main btn-large signup-btn"
            disabled={isPwMatch === false || !isEmailVerified}
          >
            비밀번호 변경
          </button>
        </form>
      </div>
    </div>
  );
}

export default PwResetPage;
