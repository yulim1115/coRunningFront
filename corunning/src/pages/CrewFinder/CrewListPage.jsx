import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CrewCreatePage";
import "./CrewPage.css";
import RegionSelector from "../../components/common/RegionSelector";
import { FaUserPlus } from "react-icons/fa";
import { getCrewList } from "../../api/crewApi.js";
import "./CrewDetailPage.jsx";

function CrewListPage() {
  const navigate = useNavigate();
  const [region, setRegion] = useState({ sido: "", gu: "" });
  const [crewList, setCrewList] = useState([]);

  // 데이터 불러오기
  useEffect(() => {
    const fetchCrews = async () => {
      try {
        const data = await getCrewList();
        setCrewList(data || []);
      } catch (error) {
        console.error("크루 목록 불러오기 실패:", error);
      }
    };

    fetchCrews();
  }, []);

  // 모집 상태 필터
  const recruitState = (recruitCount, currentCount, deadline) => {
    if (currentCount >= recruitCount || new Date(deadline) < new Date()) {
      return "모집마감";
    } else {
      return "모집중";
    }
  };

  return (
    <div>
      <section className="page-header-area">
        <h1>Crew Finder</h1>
      </section>

      <div className="registration-notice">
        <p>함께 달릴 크루를 모집하고 싶으신가요?</p>
        <button className="register-crew-btn" onClick={() => navigate("/crews/create")}>
          <FaUserPlus />&nbsp;크루 모집 등록
        </button>
      </div>

      <section className="filter-controls-area">
        <div className="filter-group-wrapper">
          <div className="filter-group">
            <label htmlFor="filter-region">지역</label>
            <div className="custom-select">
              <RegionSelector
                onChange={(selected) => {
                  setRegion(selected);
                }}
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-difficulty">난이도</label>
            <div className="custom-select">
              <select id="filter-difficulty">
                <option>전체</option>
                <option>초급</option>
                <option>중급</option>
                <option>고급</option>
              </select>
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-type">종류</label>
            <div className="custom-select">
              <select id="filter-type">
                <option>전체</option>
                <option>레귤러런</option>
                <option>드로잉런</option>
              </select>
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-status">상태</label>
            <div className="custom-select">
              <select id="filter-status">
                <option>전체</option>
                <option>모집 중</option>
                <option>모집 마감</option>
              </select>
            </div>
          </div>

          <button className="search-button">조회</button>
        </div>

        <p className="crew-count">총 {crewList.length}개의 크루</p>
      </section>

      <h2 className="crew-section-title">정기 러닝 크루</h2>
      <section className="crew-list-grid">
        {crewList.map((crew) => (
          crew.boardType === "NORMAL"
          ?<div key={crew.id} className="crew-card" onClick={() => navigate(`/crews/${crew.id}`)}>
            <div className="card-image-wrapper">
             <div className="recruitment-tag tag-recruiting">
              {recruitState(crew.recruitCount, crew.currentCount, crew.deadline)}
             </div>
            </div>
            <div className="crew-content">
              <div className="crew-info-tags">
                <span>{crew.region || "지역 미정"}</span>
              </div>
              <h3>{crew.title}</h3>
              <div className="crew-recruitment-status">
                모집 인원:{" "}
                <span style={{ color: "#4A69BB" }}>{crew.currentCount}명</span> /{" "}
                <span>{crew.recruitCount}명</span>
              </div>
              <div className="crew-meta-item">
                <strong>작성자</strong>
                <span>{crew.writerId}</span>
              </div>
              <div className="crew-meta-item">
                <strong>모집 기간</strong>
                <span>{crew.deadline}</span>
              </div>
            </div>
          </div>
        : null))}
      </section>

      <h2 className="crew-section-title">번개 러닝 크루</h2>
      <section className="crew-list-grid">
        {crewList.map((crew) => (
          crew.boardType === "FLASH"
          ?<div key={crew.id} className="crew-card" onClick={() => navigate(`/crews/${crew.id}`)}>
            <div className="card-image-wrapper">
             <div className="recruitment-tag tag-recruiting">
              {recruitState(crew.recruitCount, crew.currentCount, crew.deadline)}
             </div>
            </div>
            <div className="crew-content">
              <div className="crew-info-tags">
                <span>{crew.region || "지역 미정"}</span>
              </div>
              <h3>{crew.title}</h3>
              <div className="crew-recruitment-status">
                모집 인원:{" "}
                <span style={{ color: "#4A69BB" }}>{crew.currentCount}명</span> /{" "}
                <span>{crew.recruitCount}명</span>
              </div>
              <div className="crew-meta-item">
                <strong>작성자</strong>
                <span>{crew.writerId}</span>
              </div>
              <div className="crew-meta-item">
                <strong>모집 기간</strong>
                <span>{crew.deadline}</span>
              </div>
            </div>
          </div>
        : null))}
      </section>

      <h2 className="crew-section-title">드로잉 러닝 크루</h2>
      <section className="crew-list-grid">
        {crewList.map((crew) => (
          crew.boardType === "DRAWING"
          ?<div key={crew.id} className="crew-card" onClick={() => navigate(`/crews/${crew.id}`)}>
            <div className="card-image-wrapper">
             <div className="recruitment-tag tag-recruiting">
              {recruitState(crew.recruitCount, crew.currentCount, crew.deadline)}
             </div>
            </div>
            <div className="crew-content">
              <div className="crew-info-tags">
                <span>{crew.region || "지역 미정"}</span>
              </div>
              <h3>{crew.title}</h3>
              <div className="crew-recruitment-status">
                모집 인원:{" "}
                <span style={{ color: "#4A69BB" }}>{crew.currentCount}명</span> /{" "}
                <span>{crew.recruitCount}명</span>
              </div>
              <div className="crew-meta-item">
                <strong>작성자</strong>
                <span>{crew.writerId}</span>
              </div>
              <div className="crew-meta-item">
                <strong>모집 기간</strong>
                <span>{crew.deadline}</span>
              </div>
            </div>
          </div>
        : null))}


      </section>
    </div>
  );
}

export default CrewListPage;
