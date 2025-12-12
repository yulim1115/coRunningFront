// My Page 메인 컴포넌트
import React, { useState, useEffect } from "react";
import "./MyPage.css";
import {
  getUserAPI,
  updateUserAPI,
  getRouteByIdAPI,
  deleteRouteAPI,
  getCrewByIdAPI,
  deleteCrewAPI,
  getApplicationsAPI,
  getDashboardAPI,
} from "../../api/mypageApi";
import { useNavigate } from "react-router-dom";

// 분리 컴포넌트
import Dashboard from "./Dashboard";
import AccountEdit from "./AccountEdit";
import MyRoutes from "./MyRoutes";
import MyCrew from "./MyCrew";
import Skeleton from "./Skeleton";

const showSuccess = (msg) => {
  window.Swal.fire({
    icon: "success",
    title: "성공",
    text: msg,
  });
};

const showError = (msg) => {
  window.Swal.fire({
    icon: "error",
    title: "오류",
    text: msg,
  });
};

function MyPage() {
  const navigate = useNavigate();
  const [openPostcode, setOpenPostcode] = useState(false);
  const [detailAddress, setDetailAddress] = useState("");

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

  useEffect(() => {
    document.body.style.backgroundColor = "var(--color-bg-light)";
    return () => {
      document.body.style.backgroundColor = "var(--color-bg)";
    };
  }, []);

  // 데이터 불러오기
  useEffect(() => {
    if (!isLogin) {
      showError("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const user_data = await getUserAPI();
        setUserData(user_data);

        const route_data = await getRouteByIdAPI();
        setRoutes(route_data);

        const crew_data = await getCrewByIdAPI();
        setCrews(crew_data);

        const dashboard_data = await getDashboardAPI();
        setDashboards(dashboard_data);
      } catch (error) {
        console.error("마이페이지 정보 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLogin, navigate]);

  // 사용자 기본 정보 세팅
  useEffect(() => {
    if (userData) {
      setUserName(userData.userName ?? "");
      setUserAddress(userData.userAddress ?? "");
      setPhone(userData.phone ?? "");
    }
  }, [userData]);

  // 로딩 상태
  if (loading) return <Skeleton />;
  if (!isLogin) return null;
  if (!userData) return <div>사용자 정보를 불러오지 못했습니다.</div>;

  // 프로필 수정 데이터
  const updateData = {
    userId: userData.userId,
    userPw: userData.userPw,
    userName,
    birthDate: userData.birthDate,
    hireDate: userData.hireDate,
    phone,
    userAddress: userAddress + " " + detailAddress,
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserAPI(updateData);
      setActiveContent("dashboard");
      showSuccess("수정 완료");
    } catch {
      showError("수정 실패");
    }
  };

  // 가입일 계산
  const DayDiff = () => {
    if (!userData?.hireDate) return 0;
    const joinedDate = new Date(userData.hireDate);
    const currentDate = new Date();
    return Math.floor((currentDate - joinedDate) / (1000 * 60 * 60 * 24));
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

  // 코스 삭제
  const deleteRoute = async (routeId) => {
    try {
      await deleteRouteAPI(routeId);
      const data = await getRouteByIdAPI();
      setRoutes(data);
      showSuccess("코스 삭제 완료");
    } catch {
      showError("코스 삭제 실패");
    }
  };

  // 크루 삭제
  const deleteCrew = async (crewId) => {
    try {
      await deleteCrewAPI(crewId);
      const data = await getCrewByIdAPI();
      setCrews(data);
      showSuccess("크루 삭제 완료");
    } catch {
      showError("크루 삭제 실패");
    }
  };

  // 신청자 모달 열기
  const handleOpenApplications = async (crew) => {
    try {
      const data = await getApplicationsAPI(crew.id);
      setCrewApplications(data);
      setSelectedCrew(crew);
      setOpenCheck(true);
    } catch {
      console.error("신청자 명단 로딩 실패");
    }
  };

  // 모달 닫기
  const handleCloseApplications = () => {
    setOpenCheck(false);
    setSelectedCrew(null);
    setCrewApplications([]);
  };

  return (
    <div className="mypage-container">
      <main className="mypage-wrapper">
        {/* 좌측 메뉴 */}
        <div className="sidebar">
          <div className="profile-section">
            <div className="profile-info">
              <h2>{userData.userName} 님</h2>
              <p>
                coRunning과 <strong>{DayDiff()}</strong>일째
              </p>
            </div>
          </div>

          <ul className="menu-list">
            <li>
              <a
                className={`menu-item ${
                  activeContent === "dashboard" ? "active" : ""
                }`}
                onClick={(e) => setActiveContent("dashboard")}
              >
                러닝 통계 대시보드
              </a>
            </li>

            <li>
              <a
                className={`menu-item ${
                  activeContent === "account" ? "active" : ""
                }`}
                onClick={(e) => setActiveContent("account")}
              >
                프로필/계정 정보 수정
              </a>
            </li>

            <li>
              <a
                className={`menu-item ${
                  activeContent === "myroutes" ? "active" : ""
                }`}
                onClick={(e) => setActiveContent("myroutes")}
              >
                코스 관리
              </a>
            </li>

            <li>
              <a
                className={`menu-item ${
                  activeContent === "mycrew" ? "active" : ""
                }`}
                onClick={(e) => setActiveContent("mycrew")}
              >
                크루 모집 관리
              </a>
            </li>
          </ul>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="right-content">
          {activeContent === "dashboard" && (
            <Dashboard dashboards={dashboards} userName={userData.userName} />
          )}

          {activeContent === "account" && (
            <AccountEdit
              userData={userData}
              userName={userName}
              phone={phone}
              userAddress={userAddress}
              setUserName={setUserName}
              setPhone={setPhone}
              setUserAddress={setUserAddress}
              detailAddress={detailAddress}
              setDetailAddress={setDetailAddress}
              openPostcode={openPostcode}
              setOpenPostcode={setOpenPostcode}
              updateProfile={updateProfile}
            />
          )}

          {activeContent === "myroutes" && (
            <MyRoutes
              routes={routes}
              getDifficultyInfo={getDifficultyInfo}
              deleteRoute={deleteRoute}
              navigate={navigate}
            />
          )}

          {activeContent === "mycrew" && (
            <MyCrew
              crews={crews}
              navigate={navigate}
              openApplicants={handleOpenApplications}
              deleteCrew={deleteCrew}
              openCheck={openCheck}
              selectedCrew={selectedCrew}
              crewApplications={crewApplications}
              handleCloseApplications={handleCloseApplications}
            />
          )}
        </div>
      </main>
    </div>
  );
}
export default MyPage;
