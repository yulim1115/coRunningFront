import React, { useState, useEffect } from "react";
import "./MyPage.css";
import { getUserAPI, updateUserAPI, getRouteByIdAPI, deleteRouteAPI, getCrewByIdAPI, deleteCrewAPI, getApplicationsAPI, getDashboardAPI } from "../../api/mypageApi";
import { useNavigate } from "react-router-dom";
import DaumPostcode from "react-daum-postcode";

function MyPage() {
  const navigate = useNavigate();
  const [openPostcode, setOpenPostcode] = useState(false);
  const [detailAddress, setDetailAddress] = useState("");     // 사용자가 입력한 상세주소


  const [userData, setUserData] = useState(null);
  const [activeContent, setActiveContent] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const isLogin = sessionStorage.getItem("isLogin") === "true";

  const [routes, setRoutes] = useState([]);
  const [crews, setCrews] = useState([]);

  const [crewApplications, setCrewApplications] = useState([]);
  const [openCheck, setOpenCheck] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState(null);

  const [dashboards, setDashboards] = useState([]);



  // 로그인 체크 + 유저 정보 불러오기 + 코스 정보 불러오기 + 크루 정보 불러오기 + 대시보드 불러오기
  useEffect(() => {
    if (!isLogin) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const user_data = await getUserAPI(sessionStorage.getItem("userEmail"));
        setUserData(user_data);
        const route_data = await getRouteByIdAPI(sessionStorage.getItem("userEmail"));
        setRoutes(route_data);
        const crew_data = await getCrewByIdAPI(sessionStorage.getItem("userEmail"));
        setCrews(crew_data);
        const dashboard_data = await getDashboardAPI();
        setDashboards(dashboard_data);
      } catch (error) {
        console.error("정보 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLogin, navigate]);


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
    userAddress: userAddress + " " + detailAddress
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
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
  const isClosed = (recruitCount, currentCount, deadline) => {
    const max = Number(recruitCount);
    const cur = Number(currentCount);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(deadline);

    if (!isNaN(d.getTime()) && d < today) return true;
    return cur >= max;
  };

  //모집 상태 텍스트 
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

  
// 신청자 명단 열기
const handleOpenApplications = async (crew) => {
  try {
    const data = await getApplicationsAPI(crew.id);
    setCrewApplications(data);
    setSelectedCrew(crew);
    setOpenCheck(true);
  } catch (error) {
    console.error("신청자 명단 불러오기 실패:", error);
  }
};

  // 닫기
  const handleCloseApplications = () => {
    setOpenCheck(false);
    setSelectedCrew(null);
    setCrewApplications([]);
  };

  //대시보드
 function getTotalRecordTime(dashboards) {
  if (!Array.isArray(dashboards)) return "00:00:00";

  let totalSeconds = 0;
  let totalDistance = 0;
  let myPace = 0;

  dashboards.forEach(d => {
    const timeStr = d.record.split(" ")[1];
    const [h, m, s] = timeStr.split(":").map(Number);
    totalSeconds += h * 3600 + m * 60 + s;
    totalDistance += d.distance;
    myPace += h*3600 + m*60+ s;
  });

  const HH = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const MM = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const SS = String(totalSeconds % 60).padStart(2, "0");
  const avgPace = myPace/dashboards.length;
  const paceM = Math.floor(avgPace/60);
  const paceS = avgPace%60;

  return [`${HH}:${MM}:${SS}`, totalDistance, paceM, paceS];
}


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
                <h3>{getTotalRecordTime(dashboards)[1]} KM</h3>
                <p>총 달린 거리</p>
              </div>
              <div className="stat-card">
                <h3>{dashboards.length} 회</h3>
                <p>총 완주 횟수</p>
              </div>
              <div className="stat-card">
                <h3>{getTotalRecordTime(dashboards)[0]}</h3>
                <p>총 달린 시간</p>
              </div>
              <div className="stat-card">
                <h3>{getTotalRecordTime(dashboards)[2]}′{getTotalRecordTime(dashboards)[3]}″</h3>
                <p>내 페이스</p>
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
                <h2 className="form-section-header">회원 정보</h2>
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

                {/* Daum Postcode 주소 입력 영역 */}
                <div className="form-group">
                  <label>주소</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      id="post-code"
                      placeholder="우편번호"
                      value={userAddress}
                      readOnly
                      style={{ width: '300px', marginBottom: 10 }}
                      onClick={() => setOpenPostcode(true)}
                    />
                    <input
                      type="text"
                      placeholder="상세 주소 (선택)"
                      value={detailAddress}
                      style={{ width: '300px', marginBottom: 10}}
                      onChange={(e) => setDetailAddress(e.target.value)}
                    />
                    <button
                      type="button"
                      className="postcode-btn"
                      onClick={() => setOpenPostcode(true)}
                      style={{
                        marginLeft: 10,
                        padding: '8px 12px',
                        background: '#4A69BB',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
                    >
                      주소찾기
                    </button>
                  </div>
                  
                </div>

                {/* Daum Postcode 모달 */}
                {openPostcode && (
                  <div className="postcode-modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div className="postcode-modal" style={{
                      background: 'white',
                      padding: 20,
                      borderRadius: 8,
                      maxWidth: 500,
                      width: '90%'
                    }}>
                      <DaumPostcode
                        onComplete={(data) => {
                          const fullAddress = `${data.address}`.trim();
                          setUserAddress(fullAddress);
                          setOpenPostcode(false);
                        }}
                        autoClose
                      />
                      <button
                        onClick={() => setOpenPostcode(false)}
                        style={{
                          marginTop: 15,
                          padding: '8px 20px',
                          background: '#ccc',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                )}

                <div className="action-buttons">
                  <button type="submit" className="register-btn" onClick={updateProfile}>
                    수정 완료
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => {
                    // 취소 시 원래 데이터로 복원
                    setUserName(userData.userName ?? "");
                    setPhone(userData.phone ?? "");
                    setUserAddress(userData.userAddress ?? "");
                  }}>
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
              <section className="route-list-single-column" >
                {routes.map((route) => (
                  <div className="route-manage-item" >
                    <div className="route-info-detail" onClick={() => navigate(`/routes/${route.route_id}`)}>
                      <h3 style={{ fontSize: 18, color: "#1A2F4B", }} >
                        {route.title}
                        <span className="course-tag-manage">
                          {route.type === "drawing" ? "드로잉런" : "레귤러런"}
                        </span>
                      </h3>
                      <div className="route-meta-group">
                        <span style={{ display: "inline-flex", alignItems: "center", marginRight: 15, }} >
                          <i className="fas fa-map-marker-alt"
                            style={{ color: "#4A69BB", marginRight: 5, fontSize: 13, }} />
                          {route.location}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", }} >
                          <i className="fas fa-route"
                            style={{ color: "#4A69BB", marginRight: 5, fontSize: 13, }} />
                          {route.distance} KM
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", }} >
                          <i className="fas fa-shoe-prints"
                            style={{ color: "#4A69BB", marginRight: 5, fontSize: 13, }} />
                          {getDifficultyInfo(route.difficulty).label}
                        </span>
                        <span
                          className="likes" style={{ display: "inline-flex", alignItems: "center", }} >
                          <i className="fas fa-heart"
                            style={{ color: "#4A69BB", marginRight: 5, fontSize: 13, }} />
                          {route.likes || 0}
                        </span>
                      </div>
                    </div>
                    <div class="item-actions">
                      <button class="btn-inline-action"
                        style={{ height: "32px", padding: "0 10px", fontSize: "13px", fontWeight: "500", borderRadius: "4px", background: "none", border: "1px solid #D9534F", color: "#D9534F" }}
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
                  <div className="route-manage-item" >
                    <div className="route-info-detail" onClick={() => navigate(`/crews/${crew.id}`)}>
                      <h3 style={{ fontSize: 18, color: "#1A2F4B", }} >
                        {crew.title}
                        <span className="crew-tag-status crew-tag-recruiting">
                          {recruitStateText(crew.recruitCount, crew.currentCount, crew.deadline)}
                        </span>
                      </h3>
                      <div className="route-meta-group">
                        <span style={{ display: "inline-flex", alignItems: "center" }} >
                          <i className="fas fa-map-marker-alt" style={{ color: "#4A69BB", marginRight: 5, fontSize: 13, }} />
                          {crew.region}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center" }} >
                          <i className="fas fa-users" style={{ color: "#4A69BB", marginRight: 5, fontSize: 13, }} />
                          {crew.currentCount}명 / {crew.recruitCount}명
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center" }} >
                          <i className="fas fa-calendar-alt" style={{ color: "#4A69BB", marginRight: 5, fontSize: 13, }} />
                          {crew.deadline} 마감
                        </span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button
                        className="btn-inline-action"
                        style={{
                          height: 32, padding: "0 10px", fontSize: 13, fontWeight: 500, borderRadius: 4,
                          background: "none", border: "1px solid #4A69BB", color: "#4A69BB"
                        }}
                        onClick={() => handleOpenApplications(crew)}>신청자 명단
                      </button>

                      <button
                        className="btn-inline-action"
                        style={{
                          height: 32, padding: "0 10px", fontSize: 13, fontWeight: 500, borderRadius: 4,
                          background: "none", border: "1px solid #DDDDDD", color: "#666666",
                        }}
                        onClick={() => navigate(`/crews/modify/${crew.id}`)}>
                        <i className="fas fa-edit" /> 수정
                      </button>
                      <button
                        className="btn-inline-action"
                        style={{ height: "32px", padding: "0 10px", fontSize: "13px", fontWeight: "500", borderRadius: "4px", background: "none", border: "1px solid #D9534F", color: "#D9534F" }}
                        onClick={() => deleteCrew(crew.id)} >
                        <i className="fas fa-trash-alt" /> 삭제
                      </button>
                    </div>
                  </div>
                ))}
                {openCheck && (
                        <div className="modal-overlay" onClick={handleCloseApplications} >
                          <div className="modal-box" 
                            onClick={(e) => e.stopPropagation()}  // 모달 안 클릭 시 배경 클릭 이벤트 막기
                          >
                            <h3 style={{ marginBottom: 10 }}>
                              신청자 명단 {selectedCrew && `- ${selectedCrew.title}`}
                            </h3>

                            {crewApplications.length === 0 ? (
                              <p>아직 신청자가 없습니다.</p>
                            ) : (
                              <ul className="application-list">
                                {crewApplications.map((app) => (
                                  <li key={app.id} className="application-item">
                                    <span>이름 : {app.applicantName}</span><br/>
                                    <span>번호 : {app.phone}</span><br/><br/>
                                    <hr/><br/>
                                  </li>
      
                                  
                                ))}
                              </ul>
                            )}

                            <button
                              className="btn-inline-action"
                              style={{ marginTop: 15, padding: "6px 12px", borderRadius: 4, border: "1px solid #ccc" }}
                              onClick={handleCloseApplications}
                            >
                              닫기
                            </button>
                          </div>
                        </div>
                      )}
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
