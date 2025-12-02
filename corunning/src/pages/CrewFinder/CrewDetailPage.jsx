/* CrewDetailPage.jsx */
import React, { useEffect, useState, useRef } from "react";
import "./CrewDetailPage.css";

import {
  FaMapMarkerAlt,
  FaUser,
  FaClock,
} from "react-icons/fa";

import { useParams, useNavigate } from "react-router-dom";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  getCrewDetailAPI,
  applyCrewAPI,
  getCrewCommentsAPI,
  postCrewCommentAPI,
  deleteCrewCommentAPI,
  checkApplicationAPI,
} from "../../api/crewApi";

function CrewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [crew, setCrew] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [error, setError] = useState("");

  const loginUserId = sessionStorage.getItem("userEmail");

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  /* 날짜 포맷 */
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(d.getDate()).padStart(2, "0")}`;
  };

  /* 타입 태그 라벨 */
  const getTypeLabel = (type) => {
    switch (type) {
      case "FLASH":
        return "번개";
      case "DRAWING":
        return "드로잉";
      default:
        return "일반";
    }
  };

  /* 타입 태그 클래스 */
  const getTypeTagClass = (type) => {
    switch (type) {
      case "FLASH":
        return "tag-type-flash";
      case "DRAWING":
        return "tag-type-drawing";
      default:
        return "tag-type-normal";
    }
  };

  /* 상세 + 댓글 */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const detail = await getCrewDetailAPI(id);
        const commentList = await getCrewCommentsAPI(id);

        setCrew(detail);
        setComments(commentList);

        if (loginUserId) {
          const applied = await checkApplicationAPI(id);
          setIsApplied(applied);
        }
      } catch (err) {
        console.error(err);
        setError("크루 정보를 불러오는 중 오류 발생");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, loginUserId]);

  /* 지도 렌더 */
  useEffect(() => {
    if (!crew?.routePathJson || loading) return;

    let coords;
    try {
      coords = JSON.parse(crew.routePathJson);
    } catch (e) {
      console.error("좌표 파싱 오류", e);
      return;
    }

    if (!Array.isArray(coords) || coords.length < 2) return;
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: coords[0],
      zoom: 14,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("routeLine", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
        },
      });

      map.addLayer({
        id: "routeLineLayer",
        type: "line",
        source: "routeLine",
        paint: { "line-width": 5, "line-color": "#e5634f" },
      });

      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds()
      );
      map.fitBounds(bounds, { padding: 40 });
      map.resize();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [crew?.routePathJson, loading]);

  /* 모집 마감 여부 */
  const isClosed =
    !crew ||
    crew.currentCount >= crew.recruitCount ||
    new Date(crew.deadline) < new Date();

  /* 신청 */
  const handleApply = async () => {
    if (!loginUserId) return alert("로그인 후 신청 가능합니다.");

    try {
      await applyCrewAPI(id);
      setIsApplied(true);
    } catch (err) {
      alert(err.response?.data || "신청 실패");
    }
  };

  /* 댓글 등록 */
  const handleAddComment = async () => {
    if (!loginUserId) return alert("로그인 후 댓글 작성");
    if (!commentInput.trim()) return;

    try {
      const newComment = await postCrewCommentAPI(id, {
        content: commentInput.trim(),
      });
      setComments((prev) => [...prev, newComment]);
      setCommentInput("");
    } catch {
      alert("댓글 등록 실패");
    }
  };

  /* 댓글 삭제 */
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      await deleteCrewCommentAPI(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      alert("댓글 삭제 실패");
    }
  };

  /* 스켈레톤 */
  if (loading) {
    return (
      <main className="crew-detail-page">로딩중...</main>
    );
  }

  if (!crew || error) {
    return (
      <main className="crew-detail-page">
        <h2>{error || "존재하지 않는 모집글입니다."}</h2>
        <button className="back-list-btn" onClick={() => navigate("/crews")}>
          목록으로
        </button>
      </main>
    );
  }

  const hasRoute = crew.routePathJson && crew.routePathJson.length > 10;

  return (
    <main className="crew-detail-page">
      {/* 제목 영역 */}
      <section className="title-section">
        <div className="title-row">
          <h1 className="crew-title">{crew.title}</h1>

          {/* 타입 태그 */}
          <span className={`crew-type-tag ${getTypeTagClass(crew.boardType)}`}>
            {getTypeLabel(crew.boardType)}
          </span>
        </div>

        <div className="meta-row">
          <span><FaUser /> {crew.writerId}</span>
          <span><FaClock /> {formatDate(crew.createdAt)}</span>
        </div>
      </section>

      {/* 메인 레이아웃 */}
      <section className="main-layout">
        <div className="left-area">
          {hasRoute ? (
            <div ref={mapContainerRef} className="map-box"></div>
          ) : (
            <div className="course-summary-box">
              <h2>크루 소개</h2>
              <p>{crew.content}</p>
            </div>
          )}
        </div>

        <div className="right-area">
          <div className="info-card">
            <h2>모집 정보</h2>

           <div className="info-row">
  <span className="info-label">모집 인원</span>
  <span className="info-value">
    <span className="recruit-current">{crew.currentCount}명</span> / {crew.recruitCount}명
  </span>
</div>

<div className="info-row">
  <span className="info-label">마감일</span>
  <span className="info-value">{crew.deadline}</span>
</div>

<div className="info-row">
  <span className="info-label">지역</span>
  <span className="info-value">{crew.region}</span>
</div>

            {/* 우측 상단 모집 상태 */}
            <div className={`info-status-tag ${isClosed ? "closed" : "recruiting"}`}>
              {isClosed ? "모집마감" : "모집중"}
            </div>
          </div>

          <div className="apply-card">
            <div className="apply-info">
              모집글 신청 시 크루장에게 정보가 전달되며 개별적으로 연락됩니다.
            </div>

            {isApplied ? (
              <button className="apply-btn done" disabled>신청완료</button>
            ) : isClosed ? (
              <button className="apply-btn disabled" disabled>모집마감</button>
            ) : (
              <button className="apply-btn active" onClick={handleApply}>
                신청하기
              </button>
            )}
          </div>

          {hasRoute && (
            <div className="course-summary-box below">
              <h2>크루 소개</h2>
              <p>{crew.content}</p>
            </div>
          )}
        </div>
      </section>

      {/* 댓글 */}
      <section className="comment-section">
        <h2 className="comment-title">댓글 ({comments.length})</h2>

        <div className="comment-input-row">
          <input
            type="text"
            placeholder="댓글을 입력하세요"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
          />
          <button className="comment-submit-btn" onClick={handleAddComment}>
            등록
          </button>
        </div>

        <div className="comment-list">
          {comments.map((c) => (
            <div className="comment-item" key={c.id}>
              <div className="comment-meta">
                <strong>{c.writerId}</strong>
                <span className="date">{formatDate(c.createdAt)}</span>

                {/* 본인 댓글일 때만 삭제 버튼 */}
                {loginUserId === c.writerId && (
                  <button
                    className="comment-delete-btn"
                    onClick={() => handleDeleteComment(c.id)}
                  >
                    삭제
                  </button>
                )}
              </div>

              <p className="comment-text">{c.content}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bottom-btn-wrapper">
        <button className="back-list-btn" onClick={() => navigate("/crews")}>
          목록으로
        </button>
      </div>
    </main>
  );
}

export default CrewDetailPage;
