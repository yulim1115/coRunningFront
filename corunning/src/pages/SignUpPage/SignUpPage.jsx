// src/pages/SignUpPage/SignUpPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DaumPostcode from "react-daum-postcode";
import "../../styles/Global.css";
import "./SignUpPage.css";
import { signUpAPI } from "../../api/userApi";

function SignUpPage() {
  const navigate = useNavigate();

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

  const [errorMsg, setErrorMsg] = useState("");

  // 비밀번호 체크
  useEffect(() => {
    if (passwordCheck.length > 0) {
      setIsPwMatch(password === passwordCheck);
    } else {
      setIsPwMatch(null);
    }
  }, [password, passwordCheck]);

  // 주소 검색 완료
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
      birthDate: birthDate,
      phone: phone,
      userAddress: address + " " + detailAddress,
      hireDate: new Date().toISOString().slice(0, 10),
    };

    try {
      await signUpAPI(data);
      alert("회원가입 성공!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message || "회원가입 실패! 이미 존재하는 정보일 수 있습니다."
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
            <p className="hint-text">영문, 숫자, 특수문자 포함 8자 이상</p>
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

          {/* 주소 */}
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

<div className="form-group">
  <input type="text" placeholder="기본 주소" value={address} disabled />
</div>

<div className="form-group">
  <input
    type="text"
    placeholder="상세 주소 (선택)"
    value={detailAddress}
    onChange={(e) => setDetailAddress(e.target.value)}
  />
</div>


          {/* 에러 메시지 */}
          {errorMsg && (
            <p className="valid-msg error">{errorMsg}</p>
          )}

          {/* 가입 버튼 */}
          <button
            type="submit"
            className="signup-submit-btn"
            disabled={isPwMatch === false || !zipcode}
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
