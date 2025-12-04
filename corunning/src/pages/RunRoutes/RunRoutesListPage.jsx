// src/pages/RunRoutes/RunRoutesListPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./RunRoutesListPage.css";

import {
  FaRoute,
  FaMapMarkerAlt,
  FaRunning,
  FaThumbsUp,
  FaChevronDown,
  FaUndo,
} from "react-icons/fa";

import { getRoutes } from "../../api/routesApi";
import { sidoList } from "sigungu";

function RunRoutesListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  /* 필터 상태 */
  const [sort, setSort] = useState("latest");
  const [region, setRegion] = useState("전체 지역");
  const [difficultyFilter, setDifficultyFilter] = useState("전체 난이도");
  const [typeFilter, setTypeFilter] = useState("전체 타입");

  /* 데이터 */
  const [originRoutes, setOriginRoutes] = useState([]);
  const [routes, setRoutes] = useState([]);

  /* 난이도 매핑 */
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

  /* 필터 적용 */
  const applyFilter = () => {
    let filtered = [...originRoutes];

    // 지역
    if (region !== "전체 지역") {
      filtered = filtered.filter((r) => r.region.startsWith(region));
    }

    // 난이도
    if (difficultyFilter !== "전체 난이도") {
      filtered = filtered.filter((r) => {
        const info = getDifficultyInfo(r.difficulty);
        return info.label === difficultyFilter;
      });
    }

    // 타입
    if (typeFilter !== "전체 타입") {
      const typeMap = { 드로잉런: "drawing", 레귤러런: "regular" };
      filtered = filtered.filter((r) => r.type === typeMap[typeFilter]);
    }

    // 정렬
    if (sort === "latest") filtered.sort((a, b) => b.id - a.id);
    if (sort === "oldest") filtered.sort((a, b) => a.id - b.id);
    if (sort === "popular") filtered.sort((a, b) => b.likes - a.likes);

    setRoutes(filtered);
  };

  /* DB에서 전체 로드 */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRoutes();

        const mapped = data.map((item) => ({
          id: item.route_id,
          title: item.title,
          type: item.type,
          region: item.location,
          difficulty: item.difficulty,
          distance: item.distance,
          likes: item.liked,
        }));

        setOriginRoutes(mapped);
        setRoutes(mapped.sort((a, b) => b.id - a.id));
      } catch (err) {
        console.error("코스 로드 실패:", err);
      }
    };

    fetchData();
  }, []);

  /* URL 파라미터 → 필터 적용 */
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const regionQ = params.get("region");
    const diffQ = params.get("difficulty");
    const typeQ = params.get("type");

    if (regionQ) setRegion(regionQ);
    if (diffQ) setDifficultyFilter(diffQ);
    if (typeQ) setTypeFilter(typeQ);
  }, [location.search]);

  /* 필터 값이 바뀔 때마다 자동 필터 */
  useEffect(() => {
    applyFilter();
  }, [region, difficultyFilter, typeFilter, sort, originRoutes]);

  /* 초기화 */
  const handleReset = () => {
    setSort("latest");
    setRegion("전체 지역");
    setDifficultyFilter("전체 난이도");
    setTypeFilter("전체 타입");
    setRoutes(originRoutes);
  };

  return (
    <main className="routes-container">
      <section className="page-header-area">
        <h1>Run Routes</h1>
      </section>

      <div className="registration-notice">
        <p>나만의 특별한 러닝 코스를 공유하고 싶으신가요?</p>
        <button
          className="register-course-btn"
          onClick={() => navigate("/routes/create")}
        >
          <FaRoute /> &nbsp; 코스 등록하기
        </button>
      </div>

      {/* 필터 */}
      <section className="filter-controls-area">
        <div className="filter-group-wrapper">

          {/* 정렬 */}
          <div className="filter-group">
            <label>정렬</label>
            <div className="custom-select">
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="latest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="popular">인기순</option>
              </select>
              <FaChevronDown className="select-arrow" />
            </div>
          </div>

          {/* 지역 */}
          <div className="filter-group">
            <label>지역</label>
            <div className="custom-select">
              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option>전체 지역</option>
                {sidoList.map((sido) => (
                  <option key={sido.code}>{sido.name}</option>
                ))}
              </select>
              <FaChevronDown className="select-arrow" />
            </div>
          </div>

          {/* 난이도 */}
          <div className="filter-group">
            <label>난이도</label>
            <div className="custom-select">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option>전체 난이도</option>
                <option>초급</option>
                <option>중급</option>
                <option>고급</option>
              </select>
              <FaChevronDown className="select-arrow" />
            </div>
          </div>

          {/* 타입 */}
          <div className="filter-group">
            <label>타입</label>
            <div className="custom-select">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option>전체 타입</option>
                <option>드로잉런</option>
                <option>레귤러런</option>
              </select>
              <FaChevronDown className="select-arrow" />
            </div>
          </div>

          {/* 초기화 */}
          <button className="reset-button" onClick={handleReset}>
            <FaUndo /> 초기화
          </button>
        </div>

        <p className="route-count">총 {routes.length}개의 코스</p>
      </section>

      {/* 리스트 */}
      <section className="route-list">
        {routes.map((route) => (
          <div
            className="route-item"
            key={route.id}
            onClick={() => navigate(`/routes/${route.id}`)}
          >
            <div className="route-card-content">
              <div className="card-title-group">
                <h3>{route.title}</h3>
                <div
                  className={
                    route.type === "drawing"
                      ? "course-tag drawing"
                      : "course-tag regular"
                  }
                >
                  {route.type === "drawing" ? "드로잉런" : "레귤러런"}
                </div>
              </div>
            </div>

            <div className="card-meta-details-wrapper">
              <div className="card-meta-details">
                <span>
                  <FaMapMarkerAlt /> {route.region}
                </span>

                <span>
                  <FaRunning />
                  <span
                    className={`difficulty-text ${
                      getDifficultyInfo(route.difficulty).className
                    }`}
                  >
                    {getDifficultyInfo(route.difficulty).label}
                  </span>
                </span>

                <span>
                  <FaRoute /> {route.distance} km
                </span>
              </div>

              <span className="likes">
                <FaThumbsUp /> {route.likes}
              </span>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

export default RunRoutesListPage;
