import React, { useEffect, useState, useRef } from "react";
import "./CrewDetailPage.css";
import { FaChevronLeft, FaUser, FaClock, FaTimes } from "react-icons/fa";
import { Link, useParams, useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  getCrewDetailAPI,
  applyCrewAPI,
  getCrewCommentsAPI,
  postCrewCommentAPI,
  deleteCrewCommentAPI,
  checkApplicationAPI,
  deleteCrewAPI,
} from "../../api/crewApi";

const showError = (msg) => {
  window.Swal.fire({
    icon: "error",
    title: "오류",
    text: msg,
  });
};

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

  // 날짜 포맷
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(d.getDate()).padStart(2, "0")}`;
  };

  // 타입 텍스트
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

  // 타입 태그 클래스
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

  // 상세 + 댓글 로딩
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
      } catch {
        setError("크루 정보를 불러오는 중 오류 발생");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, loginUserId]);

  // 지도 렌더링
  useEffect(() => {
    if (!crew?.routePathJson || loading) return;

    let coords;
    try {
      coords = JSON.parse(crew.routePathJson);
    } catch {
      return;
    }

    if (!Array.isArray(coords) || coords.length < 2 || !mapContainerRef.current)
      return;

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
      language: "ko",
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

    return () => map.remove();
  }, [crew?.routePathJson, loading]);

  // 모집마감 체크
  const isClosed =
    !crew ||
    crew.currentCount >= crew.recruitCount ||
    new Date(crew.deadline) < new Date();

  // 신청하기
  const handleApply = async () => {
    if (!loginUserId) return showError("로그인 후 신청 가능합니다.");

    try {
      await applyCrewAPI(id);
      setIsApplied(true);
    } catch (err) {
      showError(err.response?.data || "신청 실패");
    }

    setCrew((prev) => ({
      ...prev,
      currentCount: prev.currentCount + 1,
    }));
  };

  // 댓글 등록
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
      showError("댓글 등록 실패");
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      await deleteCrewCommentAPI(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      showError("댓글 삭제 실패");
    }
  };

  // 게시물 삭제
  const handleDeleteboard = async (crewId) => {
    try {
      await deleteCrewAPI(crewId);
      navigate("/crews");
    } catch {
      showError("게시물 삭제 실패");
    }
  };

  // 스켈레톤
  if (loading) {
    return (
      <main className="crew-detail-container">
        <div className="skeleton-title-section">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-tag"></div>
          <div className="skeleton-meta-row">
            <div className="skeleton skeleton-meta"></div>
            <div className="skeleton skeleton-meta"></div>
          </div>
        </div>

        <section className="main-layout">
          <div className="left-area">
            <div className="skeleton skeleton-map"></div>
          </div>

          <div className="right-area">
            <div className="skeleton skeleton-subtitle"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
          </div>
        </section>

        <section className="comment-section">
          <div className="skeleton skeleton-subtitle"></div>
          <div className="skeleton skeleton-input"></div>
          <div className="comment-list">
            {[1, 2, 3].map((v) => (
              <div key={v} className="skeleton skeleton-comment-item"></div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  // 데이터없음
  if (!crew || error) {
    return (
      <main className="crew-detail-container">
        <h2>{error || "존재하지 않는 모집글입니다."}</h2>
        <button className="back-list-btn" onClick={() => navigate("/crews")}>
          목록으로
        </button>
      </main>
    );
  }

  const hasRoute = crew.routePathJson && crew.routePathJson.length > 10;

  return (
    <main className="crew-detail-container">
      {/* 제목 영역 */}
      <section className="title-section">
        <div className="title-row">
          <h1 className="crew-title">{crew.title}</h1>
          <span className={`crew-type-tag ${getTypeTagClass(crew.boardType)}`}>
            {getTypeLabel(crew.boardType)}
          </span>
        </div>

        <div className="meta-row">
          <span>
            <FaUser />
            작성자 {crew.writer_name}
          </span>
          <span>
            <FaClock />
            작성일 {formatDate(crew.createdAt)}
          </span>
          {loginUserId === crew.writerId && (
            <div
              style={{
                display: "flex",
                marginLeft: "auto",
                gap: "var(--space-xs)",
              }}
            >
              <button
                className="btn btn-small btn-outline-soft"
                onClick={() => navigate(`/crews/modify/${crew.id}`)}
              >
                수정
              </button>
              <button
                className="btn btn-small btn-outline-danger"
                onClick={() => handleDeleteboard(crew.id)}
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 메인 레이아웃 */}
      <section className="main-layout">
        <div className="left-area">
          {hasRoute && (
            <>
              <div ref={mapContainerRef} className="map-box"></div>
              <div className="course-summary-box" style={{ marginTop: "20px" }}>
                <h3>크루 소개</h3>
                <p>{crew.content}</p>
              </div>
            </>
          )}

          {!hasRoute && (
            <div className="course-summary-box">
              <h3>크루 소개</h3>
              <p>{crew.content}</p>
            </div>
          )}
        </div>

        <div className="right-area">
          <div className="info-card">
            <h3>모집 정보</h3>

            <div className="info-row">
              <span className="info-label">모집 인원</span>
              <span className="info-value">
                <span className="recruit-current">{crew.currentCount}명</span> /{" "}
                {crew.recruitCount}명
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

            <div
              className={`info-status-tag ${
                isClosed ? "closed" : "recruiting"
              }`}
            >
              {isClosed ? "모집마감" : "모집중"}
            </div>
          </div>

          <div className="apply-card">
            <div className="apply-info">
              모집글 신청 시 크루장에게 정보가 전달되며 개별적으로 연락됩니다.
            </div>

            {isApplied ? (
              <button className="btn btn-medium btn-green" disabled>
                신청완료
              </button>
            ) : isClosed ? (
              <button className="btn btn-medium btn-disabled" disabled>
                모집마감
              </button>
            ) : (
              <button
                className="btn btn-medium btn-main btn-hover-float"
                onClick={handleApply}
              >
                신청하기
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 댓글 */}
      <section className="comment-section">
        <h2 className="comment-title">
          댓글 <span>{comments.length}개</span>
        </h2>

        <div className="comment-input-row">
          <input
            type="text"
            className="input-small"
            placeholder="댓글을 입력하세요"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
          />
          <button
            className="btn btn-accent btn-medium"
            onClick={handleAddComment}
          >
            등록
          </button>
        </div>

        <div className="comment-list">
          {comments.map((item) => (
            <div className="comment-item" key={item.id}>
              <div className="comment-writer">{item.writer_name}</div>
              <div className="comment-date">{formatDate(item.createdAt)}</div>
              <div className="comment-text">
                {item.content}
                {loginUserId === item.writerId && (
                  <button
                    className="comment-delete-btn"
                    onClick={() => handleDeleteComment(item.id)}
                  >
                    <FaTimes /> 삭제
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Link to="/crews" className="link-back">
        <FaChevronLeft /> 목록으로
      </Link>
    </main>
  );
}

export default CrewDetailPage;
