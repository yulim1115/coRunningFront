// src/pages/MainPage/MainPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaArrowRight,
  FaChevronRight,
  FaMapMarkerAlt,
  FaRoute,
  FaRunning,
  FaThumbsUp
} from "react-icons/fa";

import "./MainPage.css";
import { sidoList } from "sigungu";
import { getRoutes } from "../../api/routesApi";
import { getCrewList } from "../../api/crewApi";

function MainPage() {
  const navigate = useNavigate();

  /* 필터 */
  const [region, setRegion] = useState("전체 지역");
  const [difficulty, setDifficulty] = useState("전체 난이도");
  const [type, setType] = useState("전체 타입");

  /* 인기 코스 / 번개런 */
  const [topRoutes, setTopRoutes] = useState([]);
  const [flashCrews, setFlashCrews] = useState([]);

  /* 난이도 변환 */
  const getDifficultyInfo = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    switch (diff) {
      case "easy":
        return { label: "초급" };
      case "medium":
      case "normal":
        return { label: "중급" };
      case "hard":
        return { label: "고급" };
      default:
        return { label: difficulty };
    }
  };

  /* 타입 라벨 */
  const getTypeLabel = (type) => {
    switch (type) {
      case "DRAWING":
        return "드로잉 런";
      case "REGULAR":
      case "NORMAL":
        return "레귤러 런";
      default:
        return type;
    }
  };

  /* 모집중 여부 */
  const isRecruiting = (recruitCount, currentCount, deadline) => {
    const max = Number(recruitCount);
    const cur = Number(currentCount);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(deadline);

    if (!isNaN(d.getTime()) && d < today) return false;
    return cur < max;
  };

  /* 필터 조회 */
  const handleFilterSearch = () => {
    const params = new URLSearchParams();

    if (region !== "전체 지역") params.append("region", region);
    if (difficulty !== "전체 난이도") params.append("difficulty", difficulty);
    if (type !== "전체 타입") params.append("type", type);

    navigate(`/routes?${params.toString()}`);
  };

  /* 데이터 로드 */
  useEffect(() => {
    const loadMainData = async () => {
      try {
        /* ▶ 코스 */
        const routeData = await getRoutes();
        const mappedRoutes = routeData.map((item) => ({
          id: item.route_id,
          title: item.title,
          type: item.type,
          region: item.location,
          difficulty: item.difficulty,
          distance: item.distance,
          likes: item.liked,
        }));

        const top3 = [...mappedRoutes]
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 3);

        setTopRoutes(top3);

        /* ▶ 번개런 */
        const crewData = await getCrewList();
        const mappedCrews = crewData.map((c) => ({
          id: c.id,
          title: c.title,
          region: c.region,
          deadline: c.deadline,
          recruitCount: c.recruitCount,
          currentCount: c.currentCount,
          createdAt: new Date(c.createdAt),
          boardType: c.boardType,
        }));

        /* 모집중 + FLASH만 */
        const flash3 = mappedCrews
          .filter((c) => c.boardType === "FLASH")
          .filter((c) => isRecruiting(c.recruitCount, c.currentCount, c.deadline))
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 3);

        setFlashCrews(flash3);
      } catch (err) {
        console.error("메인페이지 로드 오류:", err);
      }
    };

    loadMainData();
  }, []);

  return (
    <main className="main-page">
      {/* 배너 */}
      <section className="banner">
        <div className="container">
          <h1>
            나만의 러닝 코스를 <br /> 만들고 공유하며 달려보세요!
          </h1>
          <p>더 많은 러너들과 함께 당신의 발자취를 공유하세요.</p>

          <Link to="/routes/create" className="banner-btn">
            코스 생성 시작하기 <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* 필터 */}
      <section className="filter-section">
        <div className="container">
          <div className="filter-content">

            <div className="filter-text">
              <h2>코스 탐색 필터</h2>
              <p>지역, 난이도, 종류를 설정해 오늘 달릴 코스를 빠르게 찾아보세요.</p>
            </div>

            <div className="filter-box">
              <div className="filter-row">

                <select value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option>전체 지역</option>
                  {sidoList.map((s) => (
                    <option key={s.code}>{s.name}</option>
                  ))}
                </select>

                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option>전체 난이도</option>
                  <option>초급</option>
                  <option>중급</option>
                  <option>고급</option>
                </select>

                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option>전체 타입</option>
                  <option>드로잉런</option>
                  <option>레귤러런</option>
                </select>

                <button className="filter-btn" onClick={handleFilterSearch}>
                  조회하기
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 코스 + 번개런 */}
      <section className="course-crew-section">
        <div className="container">
          <div className="split-area">

            {/* 인기 코스 */}
            <div className="left">
              <div className="section-header-split">
                <div>
                  <h2>인기 코스 TOP 3</h2>
                  <p className="section-subtitle">러너들이 가장 많이 추천한 코스를 만나보세요.</p>
                </div>
                <Link to="/routes" className="section-link">
                  전체 코스 보기 <FaChevronRight />
                </Link>
              </div>

              <div className="card-list">
                {topRoutes.map((route) => {
                  const diff = getDifficultyInfo(route.difficulty);
                  const typeLabel = getTypeLabel(route.type);
                  return (
                    <div
                      className="list-card"
                      key={route.id}
                      onClick={() => navigate(`/routes/${route.id}`)}
                    >
                      <div className="list-card-main">
                        <div className="card-top-row">
                          <span className="badge-type">{typeLabel}</span>
                        </div>

                        <div className="list-info">
                          <h3>{route.title}</h3>
                          <div className="list-meta">
                            <span><FaMapMarkerAlt /> {route.region}</span>
                            <span><FaRunning /> {diff.label}</span>
                            <span><FaRoute /> {route.distance}km</span>
                          </div>
                        </div>
                      </div>

                      <div className="likes">
                        <FaThumbsUp /> {route.likes}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 최신 모집중 번개런 */}
            <div className="right">
              <div className="section-header-split">
                <div>
                  <h2>모집중 번개런</h2>
                  <p className="section-subtitle">지금 바로 합류할 수 있는 번개런이에요.</p>
                </div>
                <Link to="/crews" className="section-link">
                  전체 크루 보기 <FaChevronRight />
                </Link>
              </div>

              <div className="card-list">
                {flashCrews.map((crew) => (
                  <div
                    className="list-card"
                    key={crew.id}
                    onClick={() => navigate(`/crews/${crew.id}`)}
                  >
                    <div className="list-card-main">
                      <div className="card-top-row">
                        <span className="badge-type badge-flash">번개런</span>
                      </div>

                      <div className="list-info">
                        <h3>{crew.title}</h3>

                        <div className="list-meta">
                          <span><FaMapMarkerAlt /> {crew.region}</span>
                          <span>{crew.deadline} 모집 종료</span>
                        </div>
                      </div>
                    </div>

                    <span className="crew-status recruiting">모집중</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

export default MainPage;
