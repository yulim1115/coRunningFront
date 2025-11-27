// src/pages/SignUpPage/SignUpPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DaumPostcode from "react-daum-postcode";
import "../../styles/Global.css";
import "./SignUpPage.css";
import { signUpAPI } from "../../api/userApi";

function SignUpPage() {
  const navigate = useNavigate();

  // ---------------- 기본 입력값 state ----------------
  const [email, setEmail] = useState("");            // 이메일(ID)
  const [password, setPassword] = useState("");      // 비밀번호
  const [passwordCheck, setPasswordCheck] = useState(""); // 비번 확인
  const [isPwMatch, setIsPwMatch] = useState(null);  // 비번 일치 여부

  const [name, setName] = useState("");              // 이름
  const [birthDate, setBirthDate] = useState("");    // 생년월일
  const [phone, setPhone] = useState("");            // 연락처

  // ---------------- 주소 관련 state ----------------
  const [zipcode, setZipcode] = useState("");        // 우편번호
  const [address, setAddress] = useState("");        // 기본 주소
  const [detailAddress, setDetailAddress] = useState(""); // 상세 주소

  const [showPostcode, setShowPostcode] = useState(false); // 주소검색창 ON/OFF

  // ---------------- 에러 메시지 ----------------
  const [errorMsg, setErrorMsg] = useState("");

  // ---------------- 비밀번호 체크 useEffect ----------------
  useEffect(() => {
    // 비밀번호 확인 칸에 뭔가 입력된 상태에서만 검사
    if (passwordCheck.length > 0) {
      setIsPwMatch(password === passwordCheck);
    } else {
      // 비밀번호 확인 칸이 비어 있을 때
      setIsPwMatch(null);
    }
  }, [password, passwordCheck]);

  // ---------------- 주소 검색 완료 콜백 ----------------
  const onCompleteAddress = (data) => {
    // data.zonecode : 우편번호, data.address : 기본주소
    setZipcode(data.zonecode);
    setAddress(data.address);
    setShowPostcode(false); // 검색창 닫기
  };

  // ---------------- 회원가입 요청 ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // 백엔드에 보낼 데이터 형식 (백엔드와 약속된 필드명 그대로)
    const data = {
      userId: email,
      userPw: password,
      userName: name,
      birthDate: birthDate,
      phone: phone,
      userAddress: address + " " + detailAddress,
      hireDate: new Date().toISOString().slice(0, 10), // 오늘 날짜 (예: 2025-11-27)
    };

    try {
      await signUpAPI(data);      // POST /api/users 로 요청
      alert("회원가입 성공!");
      navigate("/login");        // 가입 후 로그인 페이지로 이동
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message ||
          "회원가입 실패! 이미 존재하는 정보일 수 있습니다."
      );
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-box">
        <h2>회원 가입</h2>

        <form onSubmit={handleSubmit}>
          {/* 이메일 */}
          <div className="form-group">
            <label>이메일 (ID) *</label>
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
            <label>비밀번호 *</label>
            <input
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* 👉 여기 있던 '비밀번호 조건 안내 문구'는 제거함 */}
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label>비밀번호 확인 *</label>
            <input
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
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

          {/* 이름 */}
          <div className="form-group">
            <label>이름 *</label>
            <input
              type="text"
              placeholder="이름을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* 생년월일 */}
          <div className="form-group">
            <label>생년월일 *</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          {/* 연락처 */}
          <div className="form-group">
            <label>연락처</label>
            <input
              type="text"
              placeholder="010-XXXX-XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* 주소 - 우편번호 + 검색 버튼 */}
          <div className="form-group">
            <label>주소 *</label>
            <div className="address-row">
              <input
                type="text"
                placeholder="우편번호"
                value={zipcode}
                disabled
              />
              <button
                type="button"
                className="address-search-btn"
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

          {/* 에러 메시지 */}
          {errorMsg && <p className="valid-msg error">{errorMsg}</p>}

          {/* 가입 버튼 
              - 비밀번호가 불일치(isPwMatch === false) 이거나
              - 우편번호(주소검색)를 아직 안 했을 때(!zipcode)
              → 비활성화(disabled)
          */}
          <button
            type="submit"
            className="signup-submit-btn"
            disabled={isPwMatch === false || !zipcode}
          >
            회원 가입
          </button>
        </form>

        {/* 로그인 안내 */}
        <p className="login-guide">
          이미 회원이신가요?
          <span className="link-text" onClick={() => navigate("/login")}>
            로그인
          </span>
        </p>
      </div>

      {/* 주소 검색 모달 (Daum/Kakao 우편번호 API) */}
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
