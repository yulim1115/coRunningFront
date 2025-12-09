// SignUpPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DaumPostcode from "react-daum-postcode";
import "./SignUpPage.css";
import axios from "axios";
import { signUpAPI, nameCheckAPI } from "../../api/userApi";

function SignUpPage() {
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
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");

  const [zipcode, setZipcode] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [showPostcode, setShowPostcode] = useState(false);

  const [isNameMatch, setIsNameMatch] = useState(null);
  const [clickChecked, setClickChecked] = useState(false);

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
      alert("이미 로그인된 상태입니다.");
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
    if (!email) return alert("이메일을 입력해주세요.");

    try {
      const res = await axios.get(`/api/users/check-email?email=${email}`);
      if (res.data === true) {
        alert("이미 사용 중인 이메일입니다.");
        return;
      }

      await axios.post("/api/auth/send-code", { email });
      alert("인증번호가 이메일로 전송되었습니다!");
      setIsCodeSent(true);
      setShowCodeInput(true);
      setTimer(180);
    } catch (err) {
      alert("인증번호 전송 중 오류 발생");
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return alert("인증번호를 입력해주세요.");

    try {
      const res = await axios.post("/api/auth/verify-code", {
        email,
        code: verificationCode,
      });

      if (res.data.valid) {
        alert("인증 완료되었습니다!");
        setIsEmailVerified(true);
        setTimer(0);
      } else {
        alert("인증 실패! 인증번호가 올바르지 않습니다.");
      }
    } catch (err) {
      alert("인증 요청 중 오류 발생");
    }
  };

  const nameCheckEvent = async () => {
    setClickChecked(true);
    if (name.length > 0) {
      try {
        const nameCheck = await nameCheckAPI(name);
        setIsNameMatch(nameCheck.data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const onCompleteAddress = (data) => {
    setZipcode(data.zonecode);
    setAddress(data.address);
    setShowPostcode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const data = {
      userId: email,
      userPw: password,
      userName: name,
      birthDate,
      phone,
      userAddress: address + " " + detailAddress,
      hireDate: new Date().toISOString().slice(0, 10),
    };

    if (!isEmailVerified) return alert("이메일 인증을 완료해주세요.");

    try {
      await signUpAPI(data);
      alert("회원가입 성공!");
      navigate("/login");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "회원가입 실패!");
    }
  };

  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <h2 className="signup-title">Sign Up</h2>

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

            {showCodeInput && !isEmailVerified && (
              <div className="flex-row" style={{ marginTop: "8px" }}>
                <input
                  type="text"
                  placeholder="인증번호 6자리"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-sub"
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

          <div className="form-group">
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

          <div className="form-group">
            <label className="form-label">
              이름 <span className="required">*</span>
            </label>
            <div className="flex-row">
              <input
                type="text"
                placeholder="이름 입력"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-accent btn-large"
                onClick={nameCheckEvent}
              >
                중복확인
              </button>
            </div>
            {clickChecked &&
              (isNameMatch ? (
                <p className="valid-msg success">사용 가능합니다.</p>
              ) : (
                <p className="valid-msg error">이미 사용중입니다.</p>
              ))}
          </div>

          <div className="form-group">
            <label className="form-label">
              생년월일 <span className="required">*</span>
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              연락처 <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="010-XXXX-XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="address-group">
            {/* 우편번호 + 검색 */}
            <div className="form-group">
              <label className="form-label">
                주소 <span className="required">*</span>
              </label>

              <div className="flex-row">
                <input
                  type="text"
                  placeholder="우편번호"
                  value={zipcode}
                  disabled
                />
                <button
                  type="button"
                  className="btn btn-accent btn-large"
                  onClick={() => setShowPostcode(true)}
                >
                  주소 검색
                </button>
              </div>
            </div>

            {/* 기본 주소 */}
            <div className="form-group">
              <input
                type="text"
                placeholder="기본 주소"
                value={address}
                disabled
              />
            </div>

            {/* 상세 주소 */}
            <div className="form-group">
              <input
                type="text"
                placeholder="상세 주소 (선택)"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
              />
            </div>
          </div>

          {/* 주소 모달 */}
          {showPostcode && (
            <div className="postcode-modal-overlay">
              <div className="postcode-modal">
                <DaumPostcode autoClose onComplete={onCompleteAddress} />
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => setShowPostcode(false)}
                  style={{ marginTop: "10px" }}
                >
                  닫기
                </button>
              </div>
            </div>
          )}

          {errorMsg && <p className="valid-msg error">{errorMsg}</p>}

          <button
            type="submit"
            className="btn btn-main btn-large signup-btn"
            disabled={
              isPwMatch === false ||
              !zipcode ||
              !isEmailVerified ||
              !isNameMatch
            }
          >
            회원 가입
          </button>
        </form>

        <p className="login-guide">
          이미 회원이신가요?
          <span className="link-text" onClick={() => navigate("/login")}>
            로그인
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
