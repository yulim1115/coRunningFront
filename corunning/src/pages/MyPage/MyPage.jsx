import React, { useEffect, useState } from "react";
import "./MyPage.css";
<<<<<<< Updated upstream
import DaumPostcode from "react-daum-postcode";
import { getMyInfo, updateUserInfo, updatePassword } from "../../api/userApi";
=======
import { getUserAPI, updateUserAPI, logoutAPI } from "../../api/mypageApi";
>>>>>>> Stashed changes
import { useNavigate } from "react-router-dom";

function MyPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const [phone, setPhone] = useState("");
    const [zipcode, setZipcode] = useState("");
    const [address, setAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");

    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [newPwCheck, setNewPwCheck] = useState("");

    const [showPostcode, setShowPostcode] = useState(false);

    // 주소 검색 완료 콜백
    const onCompleteAddress = (data) => {
        setZipcode(data.zonecode);
        setAddress(data.address);
        setShowPostcode(false);
    };

    useEffect(() => {
        getMyInfo()
            .then((res) => {
                const data = res.data;
                setUser(data);

                setPhone(data.phone || "");
                setZipcode(data.zonecode || "");
                setAddress(data.address || "");
                setDetailAddress(data.detailAddress || "");
            })
            .catch((err) => console.log("유저 정보 오류:", err));
    }, []);

    const handleUpdateInfo = async () => {
        try {
            await updateUserInfo({
                phone,
                zipcode,
                address,
                detailAddress,
            });
            alert("회원 정보 수정이 완료되었습니다.");
        } catch {
            alert("회원 정보 수정 실패");
        }
    };

    const handleUpdatePassword = async () => {
        if (newPw !== newPwCheck) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            await updatePassword({
                currentPassword: currentPw,
                newPassword: newPw,
            });
            alert("비밀번호 변경 완료!");
        } catch {
            alert("비밀번호 변경 실패");
        }
    };

    if (!user) return <div>로딩 중...</div>;

    return (
        <div className="mypage-wrapper">
            <div className="mypage-card">

                <h2 className="mypage-title">프로필/계정 정보 수정</h2>

                {/* 필수 정보 */}
                <h3 className="mypage-subtitle">필수 정보</h3>

                <label>이름 (수정 불가)</label>
                <input className="input" value={user.userName} disabled />

                <label>생년월일 (수정 불가)</label>
                <input className="input" value={user.birthDate} disabled />

                <label>이메일 (ID)</label>
                <input className="input" value={user.userId} disabled />

                {/* 연락처 및 주소 */}
                <h3 className="mypage-subtitle">연락처 및 주소 수정</h3>

                <label>연락처</label>
                <input
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <label>주소</label>
                <div className="zip-row">
                    <input
                        className="zip-input"
                        value={zipcode}     // ★ user.zipCode → zipCode 로 변경됨
                        onChange={(e) => setZipcode(e.target.value)}
                        disabled
                    />

                    <button className="btn-search" onClick={() => setShowPostcode(true)}>주소 검색</button>
                </div>

                <input
                    className="input"
                    value={address}
                    onChange={(e) => setZipcode(e.target.value)}
                    disabled
                />

                <input
                    className="input"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                />

                {/* 비밀번호 변경 */}
                <h3 className="mypage-subtitle">비밀번호 변경</h3>
                <p className="pw-info">보안 강화를 위해 주기적으로 비밀번호를 변경해주세요.</p>

                <label>현재 비밀번호 *</label>
                <input
                    type="password"
                    className="input"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                />

                <div className="pw-row">
                    <div className="pw-column">
                        <label>새 비밀번호 *</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="8자 이상 입력"
                            value={newPw}
                            onChange={(e) => setNewPw(e.target.value)}
                        />
                    </div>

                    <div className="pw-column">
                        <label>새 비밀번호 확인 *</label>
                        <input
                            type="password"
                            className="input"
                            value={newPwCheck}
                            onChange={(e) => setNewPwCheck(e.target.value)}
                        />
                    </div>
                </div>

                <div className="btn-row">
                    <button className="btn-submit" onClick={handleUpdateInfo}>
                        수정 완료
                    </button>
                    <button className="btn-cancel">취소</button>
                </div>

            </div>
<<<<<<< Updated upstream

            {/* 우편번호 모달 */}
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
=======
          </div>
        );
      case "logout":
        return (
          <div id="logout" className="content-black active">
            <h1 style={{ marginBottom: 20 }}>로그아웃</h1>
            <p style={{ marginBottom: 30 }}>정말 로그아웃하시겠습니까?</p>

            <div style={{display: "flex", gap: "10px"}}>
              <button 
                className="register-btn"
                onClick={async() => {
                  try {
                    await logoutAPI();
                  } catch(e) {
                    console.error("로그아웃 실패: ",e);
                  }

                  sessionStorage.removeItem("isLogin");
                  sessionStorage.removeItem("userEmail");
                  localStorage.removeItem("user_id");

                  alert("로그아웃 완료");
                  navigate("/login");
                }}
              >
                네
              </button>

              <button
                className="cancel-btn"
                onClick={() => setActiveContent("dashboard")}
              >
                아니오
              </button>
            </div>
          </div>
        );      
    }
  };

  return (
    <div>
      <main className="container mypage-wrapper">
        <div className="sidebar">
          <div className="profile-section">
            <div className="profile-info">
              <h3 style={{ fontSize: 24 }}>{userData.userName}님</h3>
              <p>coRunning과 {DayDiff()}일째</p>
            </div>
          </div>

          <ul className="menu-list">
            <li>
              <a href="#dashboard" className={`menu-item ${activeContent === "dashboard" ? "active" : ""
                }`}
                data-content-id="dashboard"
                onClick={(e) => handleMenuClick(e, "dashboard")}
              >
                <i className="fas fa-chart-line" /> 러닝 통계 대시보드
              </a>
            </li>
            <li>
              <a
                href="#account"
                className={`menu-item ${
                  activeContent === "account" ? "active" : ""
                }`}
                data-content-id="account"
                onClick={(e) => handleMenuClick(e, "account")}
              >
                <i className="fas fa-user-cog" /> 프로필/계정 정보 수정
              </a>
            </li>
            <li>
              <a
                href="#myroutes"
                className={`menu-item ${
                  activeContent === "myroutes" ? "active" : ""
                }`}
                data-content-id="myroutes"
                onClick={(e) => handleMenuClick(e, "myroutes")}
              >
                <i className="fas fa-route" /> 코스 관리
              </a>
            </li>
            <li>
              <a
                href="#mycrew"
                className={`menu-item ${
                  activeContent === "mycrew" ? "active" : ""
                }`}
                data-content-id="mycrew"
                onClick={(e) => handleMenuClick(e, "mycrew")}
              >
                <i className="fas fa-users" /> 크루 모집 관리
              </a>
            </li>
          </ul>

          <div className="logout-link" onClick={(e) => handleMenuClick(e,"logout")}>
            <a href="#logout">
              <i className="fas fa-sign-out-alt" /> 로그아웃
            </a>
          </div>
>>>>>>> Stashed changes
        </div>
    );
}

export default MyPage;
