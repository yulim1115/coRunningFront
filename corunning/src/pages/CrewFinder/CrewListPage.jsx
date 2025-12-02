import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./CrewListPage.css";

import { FaUserPlus, FaHeart, FaCommentDots } from "react-icons/fa";

import { getCrewList } from "../../api/crewApi.js";

function CrewListPage() {
  const navigate = useNavigate();
  const [crewList, setCrewList] = useState([]);
  const [activeType, setActiveType] = useState("NORMAL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* 데이터 로드 */
  useEffect(() => {
    const fetchCrews = async () => {
      try {
        const data = await getCrewList();
        const sorted = (data || []).sort((a, b) => b.id - a.id);
        setCrewList(sorted);
      } catch (err) {
        console.error("크루 목록 불러오기 실패:", err);
      }
    };
    fetchCrews();
  }, []);

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

  /* 타입 상단 색상 */
  const getTypeTopClass = (type) => {
    switch (type) {
      case "FLASH":
        return "card-top-flash";
      case "DRAWING":
        return "card-top-drawing";
      case "NORMAL":
      default:
        return "card-top-normal";
    }
  };

  /* 타입 텍스트 라벨(카드) */
  const getTypeLabel = (type) => {
    switch (type) {
      case "FLASH":
        return "번개";
      case "DRAWING":
        return "드로잉";
      case "NORMAL":
      default:
        return "일반";
    }
  };

  /* 타입 텍스트 라벨(타이틀)*/
  const getTypeFullLabel = (type) => {
    switch (type) {
      case "FLASH":
        return "번개 러닝 크루";
      case "DRAWING":
        return "드로잉 러닝 크루";
      case "NORMAL":
      default:
        return "정기 러닝 크루";
    }
  };


  /* 타입 테두리 스타일 */  // 사용 안함
  const getTypeTagClass = (type) => {
    switch (type) {
      case "FLASH":
        return "tag-type-flash";
      case "DRAWING":
        return "tag-type-drawing";
      case "NORMAL":
      default:
        return "tag-type-normal";
    }
  };

  /* 필터 통합 적용 */
  const filteredList = crewList.filter((crew) => {
    if (crew.boardType !== activeType) return false;

    const closed = isClosed(
      crew.recruitCount,
      crew.currentCount,
      crew.deadline
    );

    if (statusFilter === "OPEN" && closed) return false;
    if (statusFilter === "CLOSED" && !closed) return false;

    return true;
  });

  return (
    <div className="crew-page-wrapper">
      {/* 페이지 헤더 */}
      <section className="page-header-area">
        <h1>Crew Finder</h1>
      </section>

      {/* 등록 안내 */}
      <div className="registration-notice">
        <p>함께 달릴 크루를 모집하고 싶으신가요?</p>

        <button
          className="register-crew-btn"
          onClick={() => navigate("/crews/create")}
        >
          <FaUserPlus />
          &nbsp;크루 모집 등록
        </button>
      </div>

      {/* 타입 탭 */}
      <section className="crew-tabs-area">
        <div className="crew-tabs">
          <button
            className={`crew-tab ${activeType === "NORMAL" ? "active" : ""}`}
            onClick={() => setActiveType("NORMAL")}
          >
            정기 러닝 크루
          </button>

          <button
            className={`crew-tab ${activeType === "FLASH" ? "active" : ""}`}
            onClick={() => setActiveType("FLASH")}
          >
            번개 러닝 크루
          </button>

          <button
            className={`crew-tab ${activeType === "DRAWING" ? "active" : ""}`}
            onClick={() => setActiveType("DRAWING")}
          >
            드로잉 러닝 크루
          </button>
        </div>
      </section>

      {/* 상태 필터 */}
      <section className="filter-controls-area">
        <div className="status-filter-group">
          <button
            className={`status-chip ${statusFilter === "ALL" ? "active" : ""}`}
            onClick={() => setStatusFilter("ALL")}
          >
            전체
          </button>

          <button
            className={`status-chip ${statusFilter === "OPEN" ? "active" : ""}`}
            onClick={() => setStatusFilter("OPEN")}
          >
            모집중
          </button>

          <button
            className={`status-chip ${
              statusFilter === "CLOSED" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("CLOSED")}
          >
            모집마감
          </button>
        </div>

        <p className="crew-count">총 {filteredList.length}개의 크루</p>
      </section>

      {/* 섹션 타이틀 */}
      <h2 className="crew-section-title">{getTypeFullLabel(activeType)}</h2>

      {/* 리스트 */}
      {filteredList.length === 0 ? (
        <div className="crew-empty">조건에 해당하는 크루가 없습니다.</div>
      ) : (
        <section className="crew-list-grid">
          {filteredList.map((crew) => {
            const closed = isClosed(
              crew.recruitCount,
              crew.currentCount,
              crew.deadline
            );

            return (
              <div
                key={crew.id}
                className="crew-card"
                onClick={() => navigate(`/crews/${crew.id}`)}
              >
                <div
                  className={`card-image-wrapper ${getTypeTopClass(
                    crew.boardType
                  )}`}
                >
                  <div
                    className={`recruitment-tag ${
                      closed ? "closed" : "recruiting"
                    }`}
                  >
                    {recruitStateText(
                      crew.recruitCount,
                      crew.currentCount,
                      crew.deadline
                    )}
                  </div>
                </div>

                <div className="crew-content">
                  <div className="crew-tag-row">
                    <span
                      className={`tag-type ${getTypeTagClass(crew.boardType)}`}
                    >
                      {getTypeLabel(crew.boardType)}
                    </span>

                    <span className="tag-region">
                      {crew.region || "지역 미정"}
                    </span>
                  </div>

                  <h3>{crew.title}</h3>

                  <div className="crew-recruitment-status">
                    모집 인원:&nbsp;
                    <span className="highlight">{crew.currentCount}명</span>
                    &nbsp;/ {crew.recruitCount}명
                  </div>

                  <div className="crew-meta-item">
                    <strong>작성자</strong>
                    <span>{crew.writerId}</span>
                  </div>

                  <div className="crew-meta-item">
                    <strong>모집 마감일</strong>
                    <span>{crew.deadline}</span>
                  </div>

                  {/* 좋아요/댓글 수 */}
                  <div className="crew-interaction">
                    <span className="count-item">
                      <FaHeart /> 0
                    </span>
                    <span className="count-item">
                      <FaCommentDots /> 0
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default CrewListPage;
