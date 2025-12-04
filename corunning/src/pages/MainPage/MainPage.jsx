// src/pages/MainPage/MainPage.jsx
import React, { useEffect, useState, useRef } from "react";
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
import mapboxgl from 'mapbox-gl';
import * as turf from "@turf/turf";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function MainPage() {
  const navigate = useNavigate();

  /* 경로 상태 */
  const [routeCoords, setRouteCoords] = useState([]);
  const [snappedCoords, setSnappedCoords] = useState([]);
  const [distance, setDistance] = useState(0);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

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

  /* 타입 라벨 (한글 변환) */
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

  /* 지도 초기화 */
  useEffect(() => {
    if(mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [126.9784, 37.5665],
      zoom: 12,
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
      if(mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  /* 마커 및 라인 */
  useEffect(() => {
    if(!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    routeCoords.forEach((pt,idx) => {
      const el = document.createElement("div");
      el.className = "map-marker";
      el.innerHTML = idx + 1;

      const marker = new mapboxgl.Marker(el, {draggable: true})
      .setLngLat(pt)
      .addTo(mapRef.current);

      marker.on("dragend",() => {
        const newPos = marker.getLngLat();
        setRouteCoords((prev) => {
          const next = [...prev];
          next[idx] = [newPos.lng, newPos.lat];
          return next;
        });
      });

      markersRef.current.push(marker);
    });

    if(mapRef.current.getLayer("temp-route"))
      mapRef.current.removeLayer("temp-route");
    if (mapRef.current.getSource("temp-route"))
      mapRef.current.removeSource("temp-route");

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

  /* 스냅된 라인 */
  useEffect(() => {
    if(!mapRef.current || snappedCoords.length === 0) return;

    if(mapRef.current.getLayer("route"))
      mapRef.current.removeLayer("route");
    if (mapRef.current.getSource("route"))
      mapRef.current.removeSource("route");

    if (mapRef.current.getLayer("temp-route"))
      mapRef.current.removeLayer("temp-route");
    if (mapRef.current.getSource("temp-route"))
      mapRef.current.removeSource("temp-route");

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
        "line-width": 6,
      },
    });
  }, [snappedCoords]);

  /* 코스 스냅 */
  const finishRoute = async () => {
    if (routeCoords.length < 2) {
      alert("경로가 너무 짧습니다.");
      return;
    }

    const str = routeCoords.map((c) => `${c[0]},${c[1]}`).join(";");

    const url = `https://api.mapbox.com/matching/v5/mapbox/walking/${str}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.matchings?.length) {
      alert("스냅 실패");
      return;
    }

    const snapped = data.matchings[0].geometry.coordinates;
    setSnappedCoords(snapped);

    const line = turf.lineString(snapped);
    const meters = Math.round(
      turf.length(line, { units: "kilometers" }) * 1000
    );
    setDistance(meters);
  };

  /* 되돌리기 */
  const undoLastPoint = () => {
    setRouteCoords((prev) => prev.slice(0,-1));
  };

  /* 초기화 */
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

  function getZoomForBBox(bbox, pxWidth = 1280, pxHeight = 800) {
    // bbox = [minLng, minLat, maxLng, maxLat]
    const WORLD_SIZE = 512;   // Mapbox tile size
    const ZOOM_MAX = 20;

    const [minLng, minLat, maxLng, maxLat] = bbox;

    // 위도 라디안 변환
    const lat2rad = (lat) => (lat * Math.PI) / 180;

    // 위도 범위 (라디안 비율)
    const latFraction = (lat2rad(maxLat) - lat2rad(minLat)) / Math.PI;

    // 경도 범위 (도 → 비율)
    const lngDiff = maxLng - minLng;
    const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

    // 각각에서 허용하는 최대 zoom
    const zoomLat = Math.log2(pxHeight / WORLD_SIZE / latFraction);
    const zoomLng = Math.log2(pxWidth / WORLD_SIZE / lngFraction);

    // 가장 작은 zoom 값 선택
    let zoom = Math.min(zoomLat, zoomLng);

    // Static image 패딩 고려 (50px)
    zoom = zoom - 0.3;

    // 최대 줌 제한
    return Math.min(zoom, ZOOM_MAX);
  }


  const downloadImage = async () => {
    const coords = snappedCoords.length ? snappedCoords : routeCoords;
    if (coords.length < 2) return alert("먼저 코스를 그려주세요.");

    try {
      // -----------------------------------------
      // 1) 좌표 간소화 — Static Image API URL 길이 제한 해결
      // -----------------------------------------
      const line = turf.lineString(coords);

      // tolerance 값은 좌표 수를 줄이는 강도
      // 0.0001 ~ 0.0005 사이 조절 가능
      const simplified = turf.simplify(line, {
        tolerance: 0.00012,
        highQuality: false,
      });

      const simpleCoords = simplified.geometry.coordinates;

      // -----------------------------------------
      // 2) BBOX 계산 → center / zoom 자동 계산
      // -----------------------------------------
      const bbox = turf.bbox(simplified);
      const [minLng, minLat, maxLng, maxLat] = bbox;

      const centerLng = (minLng + maxLng) / 2;
      const centerLat = (minLat + maxLat) / 2;

      const zoom = getZoomForBBox(bbox);

      // -----------------------------------------
      // 3) Static Image API GeoJSON 인코딩
      // -----------------------------------------
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
            },
          ],
        })
      );

      // -----------------------------------------
      // 4) Static Mapbox GET 요청 URL
      //    (좌표가 간소화되어 URL이 짧아져 422 안 뜸!)
      // -----------------------------------------
      const url =
      `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/` +
      `geojson(${overlay})/auto/1280x800?padding=50&logo=false&attribution=false` +
      `&access_token=${mapboxgl.accessToken}`;

      // -----------------------------------------
      // 5) PNG 다운로드
      // -----------------------------------------
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        console.error("Mapbox Error:", text);
        alert("이미지 생성 실패");
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


  /* ---------------- 경로 복사 ---------------- */
  const copyRoute = () => {
    const coords = snappedCoords.length ? snappedCoords : routeCoords;
    if (!coords.length) return alert("복사할 경로가 없습니다.");

    navigator.clipboard.writeText(JSON.stringify(coords));
    alert("경로가 복사되었습니다!");
  };

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

      {/* 🚀 지도 + 드로잉 컨트롤 패널 */}
      <section className="map-create-section">
        <div className="container">
          <div id="mapCaptureArea" className="map-create-inner">
            {/* 왼쪽 지도 */}
            <div className="map-area" ref={mapContainer} />

            {/* 오른쪽 패널 */}
            <div className="toolbox-area">
              <button onClick={undoLastPoint}>되돌리기</button>
              <button onClick={resetRoute}>초기화</button>
              <button className="primary" onClick={finishRoute}>
                코스 생성
              </button>

              <div className="distance-box">
                <p>총 거리</p>
                <h3>{(distance / 1000).toFixed(1)} km</h3>
              </div>

              <button onClick={downloadImage}>이미지 다운로드</button>

              <textarea
                className="coord-box"
                value={JSON.stringify(
                  snappedCoords.length ? snappedCoords : routeCoords
                )}
                readOnly
              />

              <button onClick={copyRoute}>경로 복사</button>
            </div>
          </div>
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

                        {/* 타입 태그 추가 */}
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