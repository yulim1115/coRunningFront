// 회원가입 페이지
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DaumPostcode from "react-daum-postcode";
import "./SignUpPage.css";
import axios from "axios";
import { signUpAPI, nameCheckAPI } from "../../api/userApi";

function SignUpPage() {
  const navigate = useNavigate();
  // 이메일 인증 상태
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 인증 완료 여부
  const [verificationCode, setVerificationCode] = useState(""); // 사용자가 입력한 코드
  const [showCodeInput, setShowCodeInput] = useState(false); // 인증창 표시 여부
  const [timer, setTimer] = useState(0); // 3분 타이머 (초 단위)
  const [isCodeSent, setIsCodeSent] = useState(false); // 코드 발송 여부

  // 입력값 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [isPwMatch, setIsPwMatch] = useState(null);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");

  // 주소 상태
  const [zipcode, setZipcode] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [showPostcode, setShowPostcode] = useState(false);

  // 이름 중복 체크
  const [isNameMatch, setIsNameMatch] = useState(null);
  const [clickChecked, setClickChecked] = useState(false);

  // 에러 메시지
  const [errorMsg, setErrorMsg] = useState("");
  // 인증 3분 타이머
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // 로그인 상태일 경우 차단
  useEffect(() => {
    const isLogin = sessionStorage.getItem("isLogin") === "true";
    if (isLogin) {
      alert("이미 로그인된 상태입니다.");
      window.history.back();
    }
  });

  // 비밀번호 일치 체크
  useEffect(() => {
    if (passwordCheck.length > 0) {
      setIsPwMatch(password === passwordCheck);
    } else {
      setIsPwMatch(null);
    }
  }, [password, passwordCheck]);


  // 1) 이메일 중복 체크 + 인증번호 전송
  const handleSendCode = async () => {
    if (!email) return alert("이메일을 입력해주세요.");

    try {
      // 이메일 중복 체크 API
      const res = await axios.get(`/api/users/check-email?email=${email}`);
      if (res.data === true) {
        alert("이미 사용 중인 이메일입니다.");
        return;
      }

      // 인증번호 전송 API
      await axios.post("/api/auth/send-code", { email });

      alert("인증번호가 이메일로 전송되었습니다!");
      setIsCodeSent(true);
      setShowCodeInput(true);
      setTimer(180); // 3분 타이머 시작
    } catch (err) {
      console.error(err);
      alert("인증번호 전송 중 오류가 발생했습니다.");
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
  }
  // 이름 중복 체크
  const nameCheckEvent = async () => {
    setClickChecked(true);
    if (name.length > 0) {
      try {
        const nameCheck = await nameCheckAPI(name);
        setIsNameMatch(nameCheck.data);
      } catch (e) {
        console.error(e);
      }
    } else {
      console.error("이름 입력 안됨");
    }
  };


  // 주소 검색 결과 처리
  const onCompleteAddress = (data) => {
    setZipcode(data.zonecode);
    setAddress(data.address);
    setShowPostcode(false);
  };

  // 회원 가입 요청
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
    if (!isEmailVerified) {
      return alert("이메일 인증을 완료해야 회원가입이 가능합니다!");
    }
    try {
      await signUpAPI(data);
      alert("회원가입 성공!");
      navigate("/login");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        "회원가입 실패! 이미 존재하는 정보일 수 있습니다."
      );
    }
  };

  // 화면 진입 시 화면 상단
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <h2 className="signup-title">Sign Up</h2>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* 이메일 */}
          <div className="form-group">
            <label className="form-label">
              이메일 (ID) <span className="required">*</span>
            </label>

            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailVerified(false); // 이메일 변경 시 인증 초기화
                  setIsCodeSent(false);
                  setShowCodeInput(false);
                }}
                required
                style={{ flex: 1 }}
              />

              <button
                type="button"
                className="btn btn-main"
                onClick={handleSendCode}
                disabled={isEmailVerified}
              >
                {isCodeSent ? "재전송" : "인증번호"}
              </button>
            </div>

            {/* 인증번호 입력창 */}
            {showCodeInput && !isEmailVerified && (
              <div style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
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
                    인증확인
                  </button>
                </div>

                {/* 타이머 표시 */}
                <p style={{ fontSize: "12px", marginTop: "4px", color: "#555" }}>
                  {timer > 0
                    ? `남은 시간: ${Math.floor(timer / 60)}:${String(
                        timer % 60
                      ).padStart(2, "0")}`
                    : "인증 시간이 만료되었습니다."}
                </p>
              </div>
            )}

            {/* 인증 완료 메시지 */}
            {isEmailVerified && (
              <p className="valid-msg success">✔ 이메일 인증이 완료되었습니다</p>
            )}
          </div>


          {/* 비밀번호 */}
          <div className="form-group">
            <label className="form-label">비밀번호 <span className="required">*</span></label>
            <input type="password" placeholder="비밀번호를 입력해주세요"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required />
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label className="form-label">비밀번호 확인 <span className="required">*</span></label>
            <input type="password" placeholder="비밀번호를 다시 입력해주세요"
              value={passwordCheck} onChange={(e) => setPasswordCheck(e.target.value)}
              required />
            {isPwMatch === false && <p className="valid-msg error">✖ 비밀번호가 일치하지 않습니다</p>}
            {isPwMatch === true && <p className="valid-msg success">✔ 비밀번호가 일치합니다</p>}
          </div>

          {/* 이름 */}
          <div className="form-group">
            <div>
              <label className="form-label">이름 <span className="required">*</span></label>
              <input type="text" placeholder="이름을 입력해주세요"
                value={name} onChange={(e) => setName(e.target.value)}
                required />
                <button type="button" className="btn btn-main" onClick={() => nameCheckEvent()}>중복확인</button>
            </div>
            </div>
            
          
          {clickChecked && (isNameMatch ?
            <p style={{ color: "green" }}>사용 가능한 이름입니다.</p> : <p style={{ color: "red" }}>이미 사용중인 이름입니다.</p>
          )}


          {/* 생년월일 */}
          <div className="form-group">
            <label className="form-label">생년월일 <span className="required">*</span></label>
            <input type="date" value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={birthDate ? "date-filled" : "date-empty"}
              required />
          </div>

          {/* 연락처 */}
          <div className="form-group">
            <label className="form-label">연락처 <span className="required">*</span></label>
            <input type="text" placeholder="010-XXXX-XXXX"
              value={phone} onChange={(e) => setPhone(e.target.value)}
              required />
          </div>

          {/* 주소 */}
          <div className="address-group">
            <div className="form-group">
              <label className="form-label">주소 <span className="required">*</span></label>
              <div className="address-row">
                <input type="text" placeholder="우편번호" value={zipcode} disabled />
                <button type="button" className="btn btn-large btn-main"
                  onClick={() => setShowPostcode(true)}>주소 검색</button>
              </div>
            </div>

            <div className="form-group">
              <input type="text" placeholder="기본 주소" value={address} disabled />
            </div>

            <div className="form-group">
              <input type="text" placeholder="상세 주소 (선택)"
                value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} />
            </div>
          </div>

          {/* 에러 메시지 */}
          {errorMsg && <p className="valid-msg error">{errorMsg}</p>}

          {/* 회원가입 버튼 */}
          <button type="submit"
            className="btn btn-main btn-large signup-btn"
            disabled={isPwMatch === false || !zipcode || !isEmailVerified || !isNameMatch === true}>
            회원 가입
          </button>
        </form>

        {/* 로그인 안내 */}
        <p className="login-guide">
          이미 회원이신가요?
          <span className="link-text" onClick={() => navigate("/login")}>로그인</span>
        </p>
      </div>

      {/* 주소 검색 모달 */}
      {showPostcode && (
        <DaumPostcode
          onComplete={onCompleteAddress}
          autoClose
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            width: "400px",
            height: "500px",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            zIndex: 2000,
          }}
        />
      )}
    </div>
  );
}

export default SignUpPage;
