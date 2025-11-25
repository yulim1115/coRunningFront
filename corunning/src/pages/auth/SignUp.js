import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./auth.css";

function SignUp() {
    const navigate = useNavigate();

    const [userId,setUserId]=useState("");
    const [isIdChecked, SetIsIdChecked]=useState(null); // null = 숨김, true면 OK, false면 중복임
    
    const [userPw,setUserPw]=useState("");
    const [userPwCheck, SetUserPwCheck]=useState("");
    const [isPwMatch, setIsPwMatch]=useState(null); // null = 숨김, true면 OK, false면 일치하지 않는 거임
    
    const [userName,setUserName]=useState("");
    const [birthDate,setBirthDate]=useState("");
    const [userAddress,setUserAddress]=useState("");
    const [detailAddress,setDetailAddress]=useState("");
    const [phone,setPhone]=useState("");

    // 아이디 중복확인하기
    const checkUserId = () => {
        if(userId.trim() === "") {
            SetIsIdChecked(false);
            return;
        } else {
            SetIsIdChecked(true);
        }

        // 위는 임시 과정임
    };

    // 비밀번호 확인하기
    const handlePwCheck = (value) => {
        SetUserPwCheck(value);

        if(value === "") {
            setIsPwMatch(null);
        } else if (value === userPw) {
            setIsPwMatch(true);
        } else {
            setIsPwMatch(false);
        }
    };

    const openAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: function(data) {
                // 사용자가 클릭한 주소의 정보를 가져온다
                setUserAddress(data.address); //기본 주소
            }
        }).open();
    };

    const onSignUp = async () => {
        const data = {
            userId,
            userPw,
            userName,
            birthDate,
            userAddress: userAddress + " " + detailAddress,
            phone,
            hireDate: new Date().toISOString().slice(0,10) // 자동으로 오늘 날짜로 저장 후 등록
        };

        try {
            await axios.post("http://localhost:8080/api/users", data);
            alert("회원가입 성공!");
            navigate("/login");
        } catch (e) {
            console.error(e);
            alert("회원가입 실패!");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">회원가입</h2>

                {/* 아이디 */}
                <div className="form-row">
                    <label className="form-label">아이디</label>
                    <div className="form-right">

                        <div className="input-with-btn">
                            <input 
                                className="auth-input" 
                                placeholder="아이디를 입력하세요" 
                                value={userId}
                                onChange={(e) => {
                                    setUserId(e.target.value);
                                    SetIsIdChecked(null);
                                }}
                            />

                            <button 
                                className="check-btn"
                                onClick={checkUserId}
                            >
                                중복확인
                            </button>
                        </div>

                        {/* 아래 위치하도록 구조 분리 */}
                        {isIdChecked === true && (
                            <p className="valid ok">* 사용 가능한 아이디입니다</p>
                        )}

                        {isIdChecked === false && (
                            <p className="valid error">* 이미 사용 중인 아이디입니다</p>
                        )}
                    </div>   
                </div>
                
                {/* 비밀번호 */}
                <div className="form-row">
                    <label className="form-label">비밀번호</label>
                    <div className="form-right">
                        <input 
                            className="auth-input" 
                            placeholder="비밀번호를 입력하세요"
                            type="password"
                            value={userPw}
                            onChange={(e) => {
                                setUserPw(e.target.value);
                                setIsPwMatch(null);
                            }}
                        />
                    </div>
                </div>

                {/* 비밀번호 확인*/}
                <div className="form-row">
                    <label className="form-label">비밀번호 확인</label>
                    <div className="form-right signup-mode">
                        <input 
                            className="auth-input" 
                            placeholder="비밀번호를 확인해주세요"
                            type="password"
                            value={userPwCheck}
                            onChange={(e) => handlePwCheck(e.target.value)}
                        />

                        {/* 비밀번호 일치 여부 */}
                        {isPwMatch === false && (
                            <p className="valid error">* 비밀번호가 일치하지 않습니다</p>
                        )}

                        {isPwMatch === true && (
                            <p className="valid ok">* 사용할 수 있는 비밀번호입니다</p>
                        )}
                    </div>
                </div>

                {/* 이름 */}
                <div className="form-row">
                    <label className="form-label">이름</label>
                    <div className="form-right">
                        <input 
                            className="auth-input" 
                            placeholder="이름을 입력하세요"
                            value={userName}
                            onChange={(e)=>setUserName(e.target.value)}
                        />
                    </div>
                </div>
                
                {/* 생년월일 */}
                <div className="form-row">
                    <label className="form-label">생년월일</label>
                    <div className="form-right">
                        <input 
                            className="auth-input" 
                            placeholder="생년월일을 입력하세요 (형식) YYYY-MM-DD"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                        />
                    </div>
                </div>
                
                {/* 주소 찾기 */}
                <div className="form-row">
                    <label className="form-label">주소</label>
                    <div className="form-right">
                        <div className="input-with-btn">
                            <input 
                                className="auth-input" 
                                placeholder="주소를 입력하세요" 
                                value={userAddress}
                                onChange={(e) => setUserAddress(e.target.value)}
                            />
                            <button 
                                className="address-btn"
                                onClick={openAddressSearch}   
                            >
                                주소 찾기
                            </button>
                        </div>
                    </div>
                </div>

                {/* 상세 주소 */}
                <div className="form-row">
                    <label className="form-label">주소</label>
                    <div className="form-right">
                        <input 
                            className="auth-input" 
                            placeholder="상세 주소를 입력하세요"
                            value={detailAddress}
                            onChange={(e) => setDetailAddress(e.target.value)}
                        />
                    </div>
                </div>

                {/* 전화번호 */}
                <div className="form-row">
                    <label className="form-label">전화번호</label>
                    <div className="form-right">
                        <input 
                            className="auth-input" 
                            placeholder="전화번호를 입력하세요"
                            value={phone}
                            onChange={(e)=>setPhone(e.target.value)}
                        />
                    </div>
                </div>

                {/* 버튼 */}
                <button className="auth-button" onClick={onSignUp}>Sign Up</button>

                <div className="signup-center">
                    이미 계정이 있나요? <span className="go-login" onClick={() => navigate("/login")}>로그인</span>
                </div>
            </div>
        </div>
    );
}

export default SignUp;