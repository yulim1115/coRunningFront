import React, { useState, useEffect} from "react";
import "./MyPage.css";
import { getUserAPI, updateUserAPI, getRouteByIdAPI ,deleteRouteAPI, getCrewByIdAPI, deleteCrewAPI } from "../../api/mypageApi";
import { useNavigate } from "react-router-dom";
import DaumPostcode from "react-daum-postcode";

function MyPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeContent, setActiveContent] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const isLogin = sessionStorage.getItem("isLogin") === "true";

  const [routes, setRoutes] = useState([]);
  const [crews, setCrews] = useState([]);

  // 로그인 체크 + 유저 정보 불러오기 + 코스 정보 불러오기 + 크루 정보 불러오기
  useEffect(() => {
    if (!isLogin) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const data = await getUserAPI(sessionStorage.getItem("userEmail"));
        setUserData(data);
      } catch (error) {
        console.error("사용자 정보 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    const fetchRoutes = async () => {
      try {
        const data = await getRouteByIdAPI(sessionStorage.getItem("userEmail"));
        setRoutes(data);
      } catch (error) {
        console.error("코스 정보 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();

    const fetchCrews = async () => {
      try {
        const data = await getCrewByIdAPI(sessionStorage.getItem("userEmail"));
        console.log("내 크루 정보:", data);
        setCrews(data);
      } catch (error) {
        console.error("크루 정보 불러오기 실패:", error);
      } finally {
        setLoading(false);
      } 
    };
    fetchCrews();

  }, [isLogin, navigate,userData?.userId]);

  useEffect(() => {
    if (userData) {
      setUserName(userData.userName ?? "");
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
  if (!userData) {
  // 사용자 정보 못 불러온 경우 처리
  return <div>사용자 정보를 불러오지 못했습니다. 다시 로그인해 주세요.</div>;
}

  // 수정한 프로필/계정 정보
  const updateData = {
    userId: userData.userId,
    userPw: userData.userPw,
    userName: userName,
    birthDate: userData.birthDate,
    hireDate: userData.hireDate,
    phone: phone,
    userAddress: userAddress
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      console.log("보내는 데이터:", updateData);
      await updateUserAPI(userData.userId, updateData);
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

   // 난이도 매핑
  const getDifficultyInfo = (difficulty) => {
    const diff = difficulty?.toLowerCase();

    switch (diff) {
      case "easy":
        return { label: "초급", className: "difficulty-low" };
      case "medium":
      case "normal":
        return { label: "중급", className: "difficulty-mid" };
      case "hard":
        return { label: "고급", className: "difficulty-high" };
      default:
        return { label: difficulty, className: "" };
    }
  };

  //코스 삭제
  const deleteRoute = async (routeId) => {
    try {
      await deleteRouteAPI(routeId);  
      alert("코스가 삭제되었습니다.");
      const data = await getRouteByIdAPI(userData.userId);
      setRoutes(data);
    } catch (error) {
      console.error("코스 삭제 실패:", error);
      alert("코스 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  //모집 상태 확인
  /* 모집 마감 여부 계산 */
  const isClosed = (recruitCount, currentCount, deadline) => {
    const max = Number(recruitCount);
    const cur = Number(currentCount);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(deadline);

    if (!isNaN(d.getTime()) && d < today) return true;
    return cur >= max;
  };

  /* 모집 상태 텍스트 */
  const recruitStateText = (recruitCount, currentCount, deadline) => {
    return isClosed(recruitCount, currentCount, deadline) ? "모집마감" : "모집중";
  };

  const handleMenuClick = (e, targetId) => {
    e.preventDefault();
    setActiveContent(targetId);
  };

  //크루 삭제
  const deleteCrew = async (crewId) => {
  try {
    await deleteCrewAPI(crewId);  
    alert("크루 모집 글이 삭제되었습니다.");
    const data = await getCrewByIdAPI(sessionStorage.getItem("userEmail"));
    setCrews(data);
  } catch (error) {
    console.error("크루 모집 글 삭제 실패:", error);
    alert("크루 모집 글 삭제에 실패했습니다. 다시 시도해주세요.");
  }
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
                  회원 정보
                </h2>
                <div className="form-group">
                  <label htmlFor="name"> 이름 <span></span> </label>
                  <textarea id="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>

                <div className="form-group">
                  <label htmlFor="birthdate"> 생년월일 <span>(수정 불가)</span> </label>
                  <textarea id="birthdate" value={userData.birthDate} disabled />
                </div>

                <div className="form-group">
                  <label htmlFor="email">이메일 (ID)<span>(수정 불가)</span></label>
                  <textarea type="email" id="email" value={sessionStorage.getItem("userEmail")} disabled />
                </div>

                <h2 className="form-section-header">연락처 및 주소 수정</h2>

                <div className="form-group">
                  <label htmlFor="phone">연락처</label>
                  <textarea id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <div className="form-group" style={{ whiteSpace: "pre-wrap" }}>
                  <label htmlFor="post-code">주소</label>
                  <textarea id="post-code" value={userAddress} onChange={(e) => setUserAddress(e.target.value)} />
                </div>

                <div className="action-buttons">
                  <button type="submit" className="register-btn" onClick={updateProfile}>
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
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, }}>
                <p className="route-count">총 {routes.length}개의 코스 등록됨</p>
              </div>
              <section className="route-list-single-column">
                {routes.map((route) => (
                  <div className="route-manage-item">
                    <div className="route-info-detail">
                      <h3 style={{ fontSize: 18, color: "#1A2F4B", }} >
                        {route.title}
                        <span className="course-tag-manage">
                          {route.type==="drawing"? "드로잉런" :"레귤러런" }
                        </span>
                      </h3>
                      <div className="route-meta-group">
                        <span style={{ display: "inline-flex", alignItems: "center", marginRight: 15, }} >
                          <i className="fas fa-map-marker-alt"
                            style={{ color: "#4A69BB", marginRight: 5, fontSize: 13, }} />
                          {route.location}
                        </span>
                        <span style={{ display: "inline-flex",  alignItems: "center", }} >
                          <i className="fas fa-route" 
                          style={{ color: "#4A69BB", marginRight: 5, fontSize: 13, }}/>
                          {route.distance} KM
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", }} >
                          <i className="fas fa-shoe-prints"
                          style={{ color: "#4A69BB", marginRight: 5, fontSize: 13, }}/>
                          {getDifficultyInfo(route.difficulty).label}
                        </span>
                        <span
                          className="likes" style={{ display: "inline-flex", alignItems: "center", }} >
                          <i className="fas fa-heart"
                             style={{ color: "#4A69BB", marginRight: 5, fontSize: 13, }}/>
                          {route.likes || 0}
                        </span>
                      </div>
                    </div>
                    <div class="item-actions">
                        <button class="btn-inline-action" 
                        style={{height: "32px", padding: "0 10px", fontSize: "13px", fontWeight: "500", borderRadius: "4px", background: "none", border: "1px solid #D9534F", color: "#D9534F"}}
                        onClick={() => deleteRoute(route.route_id)} >
                          <i class="fas fa-trash-alt"></i> 삭제</button>
                    </div>
                  </div>
                ))}
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
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, }} >
                <p className="route-count">총 {crews.length}개의 모집 글 등록됨</p>
              </div>
              <section className="route-list-single-column">
                {crews.map((crew) => (
                <div className="route-manage-item">
                  <div className="route-info-detail">
                    <h3 style={{ fontSize: 18, color: "#1A2F4B", }} >
                      {crew.title}
                      <span className="crew-tag-status crew-tag-recruiting">
                        {recruitStateText(crew.recruitCount, crew.currentCount, crew.deadline)}
                      </span>
                    </h3>
                    <div className="route-meta-group">
                      <span style={{ display: "inline-flex", alignItems: "center"}} >
                        <i className="fas fa-map-marker-alt" style={{ color: "#4A69BB", marginRight: 5, fontSize: 13, }} />
                        {crew.region}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center"}} >
                        <i className="fas fa-users" style={{ color: "#4A69BB", marginRight: 5, fontSize: 13, }} />
                        {crew.currentCount}명 / {crew.recruitCount}명
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center"}} >
                        <i className="fas fa-calendar-alt" style={{ color: "#4A69BB", marginRight: 5, fontSize: 13, }} />
                        {crew.deadline} 마감
                      </span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn-inline-action"
                       style={{ height: 32, padding: "0 10px", fontSize: 13, fontWeight: 500, borderRadius: 4, 
                        background: "none", border: "1px solid #4A69BB", color: "#4A69BB" }}
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
                      style={{height: "32px", padding: "0 10px", fontSize: "13px", fontWeight: "500", borderRadius: "4px", background: "none", border: "1px solid #D9534F", color: "#D9534F"}}
                      onClick={() => deleteCrew(crew.id)} >
                      <i className="fas fa-trash-alt" /> 삭제
                    </button>
                  </div>
                </div>
                ))}
              </section>
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
                className={`menu-item ${activeContent === "account" ? "active" : ""
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
                className={`menu-item ${activeContent === "myroutes" ? "active" : ""
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
                className={`menu-item ${activeContent === "mycrew" ? "active" : ""
                  }`}
                data-content-id="mycrew"
                onClick={(e) => handleMenuClick(e, "mycrew")}
              >
                <i className="fas fa-users" /> 크루 모집 관리
              </a>
            </li>
          </ul>
        </div>

        <div className="main-content" id="main-content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default MyPage;
