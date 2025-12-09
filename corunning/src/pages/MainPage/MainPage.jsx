import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChevronRight,
  FaMapMarkerAlt,
  FaRoute,
  FaRunning,
  FaThumbsUp,
} from "react-icons/fa";

import "./MainPage.css";
import { sidoList } from "sigungu";
import { getRoutes } from "../../api/routesApi";
import { getCrewList } from "../../api/crewApi";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import bannerImg from "../../assets/images/running-banner.jpg";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function MainPage() {
  const navigate = useNavigate();

  // 지도/경로 상태
  const [routeCoords, setRouteCoords] = useState([]);
  const [snappedCoords, setSnappedCoords] = useState([]);
  const [distance, setDistance] = useState(0);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // 필터 상태
  const [region, setRegion] = useState("전체 지역");
  const [difficulty, setDifficulty] = useState("전체 난이도");
  const [type, setType] = useState("전체 타입");

  // 메인 데이터 상태
  const [topRoutes, setTopRoutes] = useState([]);
  const [flashCrews, setFlashCrews] = useState([]);

  // 난이도 텍스트 변환
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

  // 타입 텍스트 변환
  const getTypeLabel = (type) => {
    switch (type) {
      case "drawing":
        return "드로잉런";
      case "regular":
        return "레귤러런";
      default:
        return type;
    }
  };

  // 모집 가능 여부
  const isRecruiting = (recruitCount, currentCount, deadline) => {
    const max = Number(recruitCount);
    const cur = Number(currentCount);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(deadline);
    if (!isNaN(d.getTime()) && d < today) return false;
    return cur < max;
  };

  // 필터 검색
  const handleFilterSearch = () => {
    const params = new URLSearchParams();
    if (region !== "전체 지역") params.append("region", region);
    if (difficulty !== "전체 난이도") params.append("difficulty", difficulty);
    if (type !== "전체 타입") params.append("type", type);
    navigate(`/routes?${params.toString()}`);
  };

  // 코스/크루 데이터 로드
  useEffect(() => {
    const loadMainData = async () => {
      try {
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

        setTopRoutes(
          [...mappedRoutes].sort((a, b) => b.likes - a.likes).slice(0, 3)
        );

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

        setFlashCrews(
          mappedCrews
            .filter((c) => c.boardType === "FLASH")
            .filter((c) =>
              isRecruiting(c.recruitCount, c.currentCount, c.deadline)
            )
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 3)
        );
      } catch (err) {
        console.error("메인페이지 로드 오류:", err);
      }
    };

    loadMainData();
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [126.9784, 37.5665],
      zoom: 12,
      language: "ko",
      attributionControl: false,
    });

    mapRef.current.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    mapRef.current.on("load", () => {
      mapRef.current.on("click", (e) => {
        const pos = e.lngLat;
        setRouteCoords((prev) => [...prev, [pos.lng, pos.lat]]);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 마커 및 임시 경로 렌더링 (routeCoords 변경시)
  useEffect(() => {
    if (!mapRef.current) return;

    // 모든 마커 제거
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // routeCoords에만 마커 생성
    routeCoords.forEach((pt, idx) => {
      const el = document.createElement("div");
      el.className = "map-marker";
      el.innerHTML = idx + 1;

      const marker = new mapboxgl.Marker(el, { draggable: true })
        .setLngLat(pt)
        .addTo(mapRef.current);

      marker.on("dragend", () => {
        const newPos = marker.getLngLat();
        setRouteCoords((prev) => {
          const next = [...prev];
          next[idx] = [newPos.lng, newPos.lat];
          return next;
        });
      });

      markersRef.current.push(marker);
    });

    // 모든 기존 레이어 제거 (temp-route, route)
    ["temp-route", "route"].forEach((layerId) => {
      if (mapRef.current.getLayer(layerId)) {
        mapRef.current.removeLayer(layerId);
      }
      if (mapRef.current.getSource(layerId)) {
        mapRef.current.removeSource(layerId);
      }
    });

    // routeCoords가 2개 이상이면 임시 경로만 그리기
    if (routeCoords.length > 1) {
      mapRef.current.addSource("temp-route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: routeCoords },
        },
      });

      mapRef.current.addLayer({
        id: "temp-route",
        type: "line",
        source: "temp-route",
        paint: { "line-color": "#4A69BB", "line-width": 4 },
      });
    }
  }, [routeCoords]);

  // 스냅 경로 렌더링 (snappedCoords 변경시)
  useEffect(() => {
    if (!mapRef.current || snappedCoords.length === 0) return;

    // 기존 레이어들 제거
    ["temp-route", "route"].forEach((layerId) => {
      if (mapRef.current.getLayer(layerId)) mapRef.current.removeLayer(layerId);
      if (mapRef.current.getSource(layerId)) mapRef.current.removeSource(layerId);
    });

    // 스냅 경로 추가
    mapRef.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: snappedCoords },
      },
    });

    mapRef.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      paint: {
        "line-color": "#FF5500",
        "line-width": 5,
      },
    });
  }, [snappedCoords]);

  // 코스 스냅
  const finishRoute = async () => {
    if (routeCoords.length < 2) {
      alert("경로가 너무 짧습니다.");
      return;
    }

    const str = routeCoords.map((c) => `${c[0]},${c[1]}`).join(";");

    const url = `https://api.mapbox.com/matching/v5/mapbox/walking/${str}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.matchings?.length) {
        alert("스냅 실패");
        return;
      }

      const snapped = data.matchings[0].geometry.coordinates;
      setSnappedCoords(snapped);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      const line = turf.lineString(snapped);
      const meters = Math.round(
        turf.length(line, { units: "kilometers" }) * 1000
      );
      setDistance(meters);
    } catch {
      alert("스냅 요청 오류");
    }
  };
  // 되돌리기
  const undoLastPoint = () => {
    setRouteCoords((prev) => prev.slice(0, -1));
    // 되돌리기 시 스냅 상태 초기화
    setSnappedCoords([]);
    setDistance(0);
  };

  // 경로 초기화
  const resetRoute = () => {
    setRouteCoords([]);
    setSnappedCoords([]);
    setDistance(0);

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (mapRef.current?.getLayer("temp-route"))
      mapRef.current.removeLayer("temp-route");
    if (mapRef.current?.getSource("temp-route"))
      mapRef.current.removeSource("temp-route");
    if (mapRef.current?.getLayer("route"))
      mapRef.current.removeLayer("route");
    if (mapRef.current?.getSource("route"))
      mapRef.current.removeSource("route");
  };

  // 코스 이미지 다운로드
  const downloadImage = async () => {
    const coords = snappedCoords.length ? snappedCoords : routeCoords;
    if (coords.length < 2) {
      alert("먼저 코스를 그려주세요.");
      return;
    }

    try {
      const line = turf.lineString(coords);
      const simplified = turf.simplify(line, {
        tolerance: 0.00012,
        highQuality: false,
      });

      const simpleCoords = simplified.geometry.coordinates;

      const overlay = encodeURIComponent(
        JSON.stringify({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                stroke: "#FF5500",
                "stroke-width": 6,
              },
              geometry: {
                type: "LineString",
                coordinates: simpleCoords,
              },
              style: "mapbox://styles/mapbox/streets-v12",
              language: "ko",
            },
          ],
        })
      );

      const url =
        `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/` +
        `geojson(${overlay})/auto/1280x800?padding=50&logo=false&attribution=false` +
        `&language=ko` +
        `&access_token=${mapboxgl.accessToken}`;

      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        console.error("Mapbox Error:", text);
        alert("이미지 생성에 실패했습니다.");
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "running-course.png";
      a.click();

      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error(e);
      alert("이미지 다운로드 중 오류가 발생했습니다.");
    }
  };

  // 경로 좌표 복사
  const copyRoute = () => {
    const coords = snappedCoords.length ? snappedCoords : routeCoords;
    if (!coords.length) {
      alert("복사할 경로가 없습니다.");
      return;
    }
    navigator.clipboard.writeText(JSON.stringify(coords));
    alert("경로가 복사되었습니다!");
  };

  return (
    <main className="main-page">
      {/* 배너 섹션 */}
      <section className="banner">
        <div className="banner-bg">
          <img src={bannerImg} alt="banner" />
        </div>

        <div className="banner-inner">
          <div className="banner-text">
            <h1>
              직접 코스를 만들고,
              <br />
              함께 달릴 크루를 모집하세요.
            </h1>
            <p>
              러닝 코스를 생성하고 공유하며,
              <br />
              러너들과 함께하는 크루를 만들 수 있는 플랫폼입니다.
            </p>
          </div>

          <div className="banner-actions">
            <Link to="/routes/create" className="banner-btn primary">
              코스 생성하기
            </Link>
            <Link to="/crews/create" className="banner-btn secondary">
              크루 모집하기
            </Link>
          </div>
        </div>
      </section>

      {/* 지도 드로잉 섹션 */}
      <section className="course-map-section">
        <div className="container">
          <div className="course-map-header">
            <h2>러닝 코스 그리기 및 생성</h2>
            <p>
              지도 위에서 클릭하여 나만의 러닝 경로를 직접 드로잉하고, 코스를 생성해보세요.
            </p>
          </div>

          <div className="course-map-layout">
            <div className="course-map-box" ref={mapContainer} />

            <div className="course-map-panel">
              <div className="panel-block">
                <h3>드로잉 컨트롤</h3>
                <div className="panel-btn-group">
                  <button className="panel-btn" onClick={undoLastPoint}>
                    되돌리기
                  </button>
                  <button className="panel-btn" onClick={resetRoute}>
                    초기화
                  </button>
                  <button className="panel-btn primary" onClick={finishRoute}>
                    코스 생성
                  </button>
                </div>
              </div>

              <div className="panel-block">
                <h3>총 거리</h3>
                <p className="panel-distance">
                  {(distance / 1000).toFixed(1)} km
                </p>
              </div>

              <div className="panel-block">
                <button className="panel-btn download" onClick={downloadImage}>
                  이미지 다운로드
                </button>
              </div>

              <div className="panel-block">
                <h3>경로 좌표 배열</h3>
                <textarea
                  readOnly
                  className="panel-coord-box"
                  value={JSON.stringify(
                    snappedCoords.length ? snappedCoords : routeCoords
                  )}
                />
                <button className="panel-btn outline" onClick={copyRoute}>
                  경로 복사
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 필터 섹션 */}
      <section className="filter-section">
        <div className="container">
          <div className="filter-content">
            <div className="filter-text">
              <h2>코스 탐색 필터</h2>
              <p>
                지역, 난이도, 종류를 설정해 오늘 달릴 코스를 빠르게 찾아보세요.
              </p>
            </div>

            <div className="filter-box">
              <div className="filter-row">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option>전체 지역</option>
                  {sidoList.map((s) => (
                    <option key={s.code}>{s.name}</option>
                  ))}
                </select>

                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option>전체 난이도</option>
                  <option>초급</option>
                  <option>중급</option>
                  <option>고급</option>
                </select>

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
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

      {/* 코스 + 번개런 섹션 */}
      <section className="course-crew-section">
        <div className="container">
          <div className="split-area">
            <div className="left">
              <div className="section-header-split">
                <div>
                  <h2>인기 코스 TOP 3</h2>
                  <p className="section-subtitle">
                    러너들이 가장 많이 추천한 코스를 만나보세요.
                  </p>
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
                            <span>
                              <FaMapMarkerAlt /> {route.region}
                            </span>
                            <span>
                              <FaRunning /> {diff.label}
                            </span>
                            <span>
                              <FaRoute /> {route.distance}km
                            </span>
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

            <div className="right">
              <div className="section-header-split">
                <div>
                  <h2>모집중 번개런</h2>
                  <p className="section-subtitle">
                    지금 바로 합류할 수 있는 번개런이에요.
                  </p>
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
                        <span className="badge-type badge-flash">
                          번개런
                        </span>
                      </div>

                      <div className="list-info">
                        <h3>{crew.title}</h3>

                        <div className="list-meta">
                          <span>
                            <FaMapMarkerAlt /> {crew.region}
                          </span>
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
