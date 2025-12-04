import React, { useEffect, useState, useRef } from "react";
import "./RunRoutesDetailPage.css";

import {
  FaMapMarkerAlt,
  FaRunning,
  FaRoute,
  FaUser,
  FaThumbsUp,
  FaBookmark,
} from "react-icons/fa";

import { useParams, useNavigate } from "react-router-dom";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  getRouteById,
  getRouteComments,
  addRouteComment,
  deleteRouteComment,
  getDipList,
  addDip,
  removeDip,
  addLike,
  removeLike,
  checkLiked,
} from "../../api/routesApi";

function RunRoutesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [route, setRoute] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loginUserId = sessionStorage.getItem("userEmail");

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const getDifficultyLabel = (d) =>
    d === "easy" ? "초급" : d === "medium" ? "중급" : d === "hard" ? "고급" : d;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(date.getDate()).padStart(2, "0")}`;
  };

  const getDescriptionLines = (txt) =>
    txt ? txt.split(/\r?\n/).filter((v) => v.trim() !== "") : [];

  // 상세 정보 + 상태 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [routeData, commentData] = await Promise.all([
          getRouteById(id),
          getRouteComments(id),
        ]);

        setRoute({
          id: routeData.route_id,
          title: routeData.title,
          type: routeData.type,
          region: routeData.location,
          difficulty: routeData.difficulty,
          distance: routeData.distance,
          writer: routeData.writer,
          writerName: routeData.writer_name,
          liked: routeData.liked ?? 0,
          description: routeData.description,
          route: routeData.route,
        });

        setComments(commentData || []);

        if (loginUserId) {
          const [dips, liked] = await Promise.all([
            getDipList(loginUserId),
            checkLiked(id),
          ]);
          setIsBookmarked(dips.some((v) => Number(v.routeId) === Number(id)));
          setIsLiked(liked);
        } else {
          setIsBookmarked(false);
          setIsLiked(false);
        }
      } catch (err) {
        console.error(err);
        setError("코스 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, loginUserId]);

  // 지도 렌더링
  useEffect(() => {
    // route가 완전히 로드되지 않았으면 실행하지 않음
    if (!route || !route.route) {
      console.log("route 데이터 대기 중...");
      return;
    }

    // setTimeout으로 DOM이 렌더링된 후 실행되도록 함
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) {
        console.warn("mapContainerRef.current가 여전히 없음");
        return;
      }

      let coords;
      try {
        coords = JSON.parse(route.route);
      } catch (e) {
        console.error("좌표 파싱 오류:", e);
        return;
      }

      if (!Array.isArray(coords) || coords.length < 2) {
        console.warn("좌표 배열 오류");
        return;
      }

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
        console.log("지도 로드 완료");
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

      map.on("error", (e) => {
        console.error("Mapbox 에러:", e);
      });
    }, 0);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [route]);

  const handleLike = async () => {
    if (!loginUserId) return alert("로그인 후 추천이 가능합니다.");
    try {
      if (!isLiked) {
        await addLike(route.id);
        setIsLiked(true);
        setRoute((prev) => ({ ...prev, liked: prev.liked + 1 }));
      } else {
        await removeLike(route.id);
        setIsLiked(false);
        setRoute((prev) => ({ ...prev, liked: prev.liked - 1 }));
      }
    } catch {
      alert("추천 처리 실패");
    }
  };

  const handleToggleBookmark = async () => {
    if (!loginUserId) return alert("로그인 후 저장이 가능합니다.");
    try {
      if (!isBookmarked) {
        await addDip(route.id, loginUserId);
        setIsBookmarked(true);
      } else {
        await removeDip(route.id, loginUserId);
        setIsBookmarked(false);
      }
    } catch {
      alert("저장 기능 처리 실패");
    }
  };

  const handleAddComment = async () => {
    if (!loginUserId) return alert("로그인 후 댓글 작성 가능");
    if (!commentInput.trim()) return;

    try {
      const newComment = await addRouteComment(id, commentInput.trim());
      setComments((prev) => [...prev, newComment]);
      setCommentInput("");
    } catch {
      alert("댓글 등록 실패");
    }
  };

  const handleDeleteComment = async (commentId, writerId) => {
    if (loginUserId !== writerId)
      return alert("본인 댓글만 삭제할 수 있습니다.");
    if (!window.confirm("삭제하시겠습니까?")) return;

    try {
      await deleteRouteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      alert("댓글 삭제 실패");
    }
  };

  // --- 로딩 스켈레톤 ---
  if (loading) {
    return (
      <main className="detail-page">
        <div className="skeleton-title-section">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-tag"></div>
          <div className="skeleton-meta-row">
            <div className="skeleton skeleton-meta"></div>
            <div className="skeleton skeleton-meta"></div>
            <div className="skeleton skeleton-meta"></div>
            <div className="skeleton skeleton-meta"></div>
          </div>
        </div>

        <section className="main-layout">
          <div className="left-area">
            <div className="skeleton skeleton-map"></div>
          </div>

          <div className="right-area">
            <div className="recommend-row">
              <div className="skeleton skeleton-btn"></div>
              <div className="skeleton skeleton-btn"></div>
            </div>

            <div className="course-summary-box">
              <div className="skeleton skeleton-subtitle"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text short"></div>
            </div>
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

  // --- 오류 처리 ---
  if (error || !route) {
    return (
      <main className="detail-page">
        <h2>{error || "존재하지 않는 코스입니다."}</h2>
        <div className="bottom-btn-wrapper">
          <button className="back-list-btn" onClick={() => navigate("/routes")}>
            목록으로
          </button>
        </div>
      </main>
    );
  }

  const descriptionLines = getDescriptionLines(route.description);
  const difficultyLabel = getDifficultyLabel(route.difficulty);

  // --- 정상 화면 ---
  return (
    <main className="detail-page">
      <section className="title-section">
        <div className="title-row">
          <h1 className="route-title">{route.title}</h1>
          <div className={`course-tag ${route.type}`}>
            {route.type === "drawing" ? "드로잉런" : "레귤러런"}
          </div>
        </div>

        <div className="meta-row">
          <span>
            <FaMapMarkerAlt /> {route.region}
          </span>
          <span>
            <FaRunning /> {difficultyLabel}
          </span>
          <span>
            <FaRoute /> {route.distance} km
          </span>
          <span>
            <FaUser /> 작성자 {route.writerName}
          </span>
        </div>
      </section>

      <section className="main-layout">
        <div className="left-area">
          <div
            ref={mapContainerRef}
            className={`map-box ${loading ? "skeleton-map" : ""}`}
          ></div>
        </div>


        <div className="right-area">
          <div className="recommend-row">
            <button
              className={`action-btn ${isLiked ? "liked" : ""}`}
              onClick={handleLike}
            >
              <FaThumbsUp /> 추천 ({route.liked})
            </button>

            <button className="action-btn" onClick={handleToggleBookmark}>
              <FaBookmark /> {isBookmarked ? "저장됨" : "저장"}
            </button>
          </div>

          <div className="course-summary-box">
            <h2>코스 소개</h2>
            {descriptionLines.length ? (
              descriptionLines.map((line, idx) => <p key={idx}>{line}</p>)
            ) : (
              <p>등록된 코스 설명이 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      <section className="comment-section">
        <h2 className="comment-title">댓글 ({comments.length}개)</h2>

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
          {comments.map((item) => (
            <div className="comment-item" key={item.id}>
              <div className="comment-meta">
                <strong>{item.writer_name}</strong>
                <span className="date">{formatDate(item.createdAt)}</span>

                {loginUserId === item.writerId && (
                  <button
                    className="comment-delete-btn"
                    onClick={() =>
                      handleDeleteComment(item.id, item.writerId)
                    }
                  >
                    삭제
                  </button>
                )}
              </div>

              <p className="comment-text">{item.content}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bottom-btn-wrapper">
        <button className="back-list-btn" onClick={() => navigate("/routes")}>
          목록으로
        </button>
      </div>
    </main>
  );
}

export default RunRoutesDetailPage;
