import React, { useState, useEffect } from "react";
import "./MyPage.css";
import { getUserAPI, updateUserAPI, logoutAPI } from "../../api/mypageApi";
import { useNavigate } from "react-router-dom";

function MyPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeContent, setActiveContent] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [phone, setPhone] = useState("");

  const isLogin = sessionStorage.getItem("isLogin") === "true";

  // 로그인 체크 + 유저 정보 불러오기
  useEffect(() => {
    if (!isLogin) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const email = sessionStorage.getItem("userEmail");
        const data = await getUserAPI(email); 
        setUserData(data);
      } catch (error) {
        console.error("사용자 정보 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLogin, navigate]);

  useEffect(() => {
    if (userData) {
      setUserId(userData.userId ?? "");
      setUserAddress(userData.userAddress ?? "");
      setPhone(userData.phone ?? "");
    }
  }, [userData]);

  // 여기 스켈레톤?? 넣음 돼여
  if (loading) {
    return <div>로딩 중...</div>;
  }
  if (!isLogin) {
    return null;
  }

  // 수정한 프로필/계정 정보
  const updateData = {
    userId: userId,
    userPw: userPw,
    userAddress: userAddress,
    phone: phone,
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserAPI(updateData);
      alert("프로필/계정 정보 수정이 완료되었습니다.");
    } catch (error) {
      console.error("프로필/계정 정보 수정 실패:", error);
      alert("프로필/계정 정보 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  //누적 가입일자 구하기
  const DayDiff = () => {
  if (!userData?.hireDate) return 0;
  const joinedDate = new Date(userData.hireDate); 
  const currentDate = new Date();
  const timeDiff = currentDate.getTime() - joinedDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  return daysDiff;
};


  const handleMenuClick = (e, targetId) => {
    e.preventDefault();
    setActiveContent(targetId);
  };

  const renderContent = () => {
    switch (activeContent) {
      case "dashboard":
      default:
        return (
          <div id="dashboard" className="content-block active">
            <div className="dashboard-title-group">
              <h1>My Page</h1>
              <h2>{userData.userName}님의 러닝 통계 대시보드</h2>
            </div>

            <h2 style={{ marginBottom: 15, marginTop: 30, }}>
              누적 기록
            </h2>
            <div className="stats-section-grid">
              <div className="stat-card">
                <h3>123.4 KM</h3>
                <p>총 누적 거리</p>
              </div>
              <div className="stat-card">
                <h3>45 회</h3>
                <p>총 완주 횟수</p>
              </div>
              <div className="stat-card">
                <h3>7.8 KM</h3>
                <p>평균 러닝 거리</p>
              </div>
              <div className="stat-card">
                <h3>45 분</h3>
                <p>평균 완주 시간</p>
              </div>
            </div>
          </div>
        );
      case "account":
        return (
          <div id="account" className="content-block active">
            <h1 style={{ marginBottom: 30 }}>프로필/계정 정보 수정</h1>
            <div>
              <form method="post">
                <h2 className="form-section-header">                
                  필수 정보
                </h2>
                <div className="form-group">
                  <label htmlFor="name">
                    이름 <span>(수정 불가)</span>
                  </label>
                  <textarea id="name" value= {userData.userName} disabled />
                </div>

                <div className="form-group">
                  <label htmlFor="birthdate">
                    생년월일 <span>(수정 불가)</span>
                  </label>
                  <textarea id="birthdate" value={userData.birthDate} disabled />
                </div>

                <div className="form-group">
                  <label htmlFor="email">이메일 (ID)</label>
                  <textarea type="email" id="email" value={userId} onChange = {(e) =>setUserId(e.target.value)} />
                </div>

                <h2 className="form-section-header">연락처 및 주소 수정</h2>

                <div className="form-group">
                  <label htmlFor="phone">연락처</label>
                  <textarea id="phone" value={phone} onChange = {(e) =>setPhone(e.target.value)} />
                </div>

                <div className="form-group">
                  <label htmlFor="post-code">주소</label>
                  {/* 우편번호 검색 API 추후 연동 예정 */}
                </div>

                <h2 className="form-section-header">비밀번호 변경</h2>
                <p
                  className="body-base"
                  style={{
                    color: "#666666",
                    marginBottom: 20,
                  }}
                >
                  보안 강화를 위해 주기적으로 비밀번호를 변경해주세요.
                </p>

                <div className="form-group">
                  <label htmlFor="current-password">
                    현재 비밀번호 <span>*</span>
                  </label>
                  <textarea
                    type="password"
                    id="current-password"
                    required
                  />
                </div>

                <div className="meta-fields">
                  <div className="form-group">
                    <label htmlFor="new-password">
                      새 비밀번호 <span>*</span>
                    </label>
                    <textarea
                      type="password"
                      id="new-password"
                      placeholder="8자 이상 입력"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm-password">
                      새 비밀번호 확인 <span>*</span>
                    </label>
                    <textarea
                      type="password"
                      id="confirm-password"
                      required
                    />
                  </div>
                </div>

                <div className="action-buttons">
                  <button  type="submit" className="register-btn" onClick={updateProfile}>
                    수정 완료
                  </button>
                  <button type="button" className="cancel-btn" >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

        case "myroutes":
        return (
          <div id="myroutes" className="content-block active">
            <h1 style={{ marginBottom: 30 }}>코스 관리</h1>
            <div style={{ padding: 0, margin: 0 }}>
              <div
                className="manage-controls"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <p className="route-count">총 4개의 코스 등록됨</p>
              </div>

              <section className="route-list-single-column">
                <div className="route-manage-item">
                  <div className="route-info-detail">
                    <h3
                      style={{
                        fontSize: 18,
                        color: "#1A2F4B",
                      }}
                    >
                      청계천 따라 달리기
                      <span className="course-tag-manage">
                        드로잉런
                      </span>
                    </h3>
                    <div className="route-meta-group">
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          marginRight: 15,
                        }}
                      >
                        <i
                          className="fas fa-map-marker-alt"
                          style={{
                            color: "#4A69BB",
                            marginRight: 5,
                            fontSize: 13,
                          }}
                        />
                        서울 종로구
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <i
                          className="fas fa-route"
                          style={{
                            color: "#4A69BB",
                            marginRight: 5,
                            fontSize: 13,
                          }}
                        />
                        6.5 KM
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <i
                          className="fas fa-shoe-prints"
                          style={{
                            color: "#4A69BB",
                            marginRight: 5,
                            fontSize: 13,
                          }}
                        />
                        초급
                      </span>
                      <span
                        className="likes"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <i
                          className="fas fa-heart"
                          style={{
                            color: "#D9534F",
                            marginRight: 5,
                            fontSize: 13,
                          }}
                        />
                        123
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        );

      case "mycrew":
        return (
          <div id="mycrew" className="content-block active">
            <h1 style={{ marginBottom: 30 }}>크루 모집 관리</h1>
            <div style={{ padding: 0, margin: 0 }}>
              <div
                className="manage-controls"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <p className="route-count">총 3개의 모집 글 등록됨</p>
              </div>

              <section className="route-list-single-column">
                <div className="route-manage-item">
                  <div className="route-info-detail">
                    <h3
                      style={{
                        fontSize: 18,
                        color: "#1A2F4B",
                      }}
                    >
                      서울 밤도깨비 러닝 크루 정기 모집
                      <span className="crew-tag-status crew-tag-recruiting">
                        모집 중
                      </span>
                    </h3>
                    <div className="route-meta-group">
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <i
                          className="fas fa-map-marker-alt"
                          style={{
                            color: "#4A69BB",
                            marginRight: 5,
                            fontSize: 13,
                          }}
                        />
                        서울시 강남구
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <i
                          className="fas fa-users"
                          style={{
                            color: "#4A69BB",
                            marginRight: 5,
                            fontSize: 13,
                          }}
                        />
                        5명 / 10명
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <i
                          className="fas fa-calendar-alt"
                          style={{
                            color: "#4A69BB",
                            marginRight: 5,
                            fontSize: 13,
                          }}
                        />
                        2025.12.31 마감
                      </span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn-inline-action"
                      style={{
                        height: 32,
                        padding: "0 10px",
                        fontSize: 13,
                        fontWeight: 500,
                        borderRadius: 4,
                        background: "none",
                        border: "1px solid #4A69BB",
                        color: "#4A69BB",
                      }}
                    >
                      신청자 명단
                    </button>
                    <button
                      className="btn-inline-action"
                      style={{
                        height: 32,
                        padding: "0 10px",
                        fontSize: 13,
                        fontWeight: 500,
                        borderRadius: 4,
                        background: "none",
                        border: "1px solid #DDDDDD",
                        color: "#666666",
                      }}
                    >
                      <i className="fas fa-edit" /> 수정
                    </button>
                    <button
                      className="btn-inline-action"
                      style={{
                        height: 32,
                        padding: "0 10px",
                        fontSize: 13,
                        fontWeight: 500,
                        borderRadius: 4,
                        background: "none",
                        border: "1px solid #D9534F",
                        color: "#D9534F",
                      }}
                    >
                      <i className="fas fa-trash-alt" /> 삭제
                    </button>
                  </div>
                </div>
              </section>
            </div>
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
        </div>

        <div className="main-content" id="main-content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default MyPage;
