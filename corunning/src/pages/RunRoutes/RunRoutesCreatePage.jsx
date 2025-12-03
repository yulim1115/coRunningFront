import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import RegionSelector from "../../components/common/RegionSelector";
import { FiChevronDown } from "react-icons/fi";
import "./RunRoutesCreatePage.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function RunRoutesCreatePage() {
  // 상태값
  const [routeCoords, setRouteCoords] = useState([]);
  const [snappedCoords, setSnappedCoords] = useState([]);
  const [distance, setDistance] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [region, setRegion] = useState({ sido: "", gu: "" });
  const [difficulty, setDifficulty] = useState("");
  const [type, setType] = useState("");

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // ---------------------- 지도 초기화 -------------------------
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [126.9784, 37.5665],
      zoom: 12,
      attributionControl: false
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

  // ---------------------- 마커 및 임시 라인 렌더 -------------------------
  useEffect(() => {
    if (!mapRef.current) return;

    // 기존 마커 초기화
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    routeCoords.forEach((pt, idx) => {
      const el = document.createElement("div");
      el.className = "map-marker";
      el.innerHTML = idx + 1;

      const marker = new mapboxgl.Marker(el, { draggable: true })
        .setLngLat(pt)
        .addTo(mapRef.current);

      marker.on("dragend", () => {
        const p = marker.getLngLat();
        setRouteCoords((prev) => {
          const next = [...prev];
          next[idx] = [p.lng, p.lat];
          return next;
        });
      });

      markersRef.current.push(marker);
    });

    // 임시 라인 제거
    if (mapRef.current.getSource("temp-route")) {
      mapRef.current.removeLayer("temp-route");
      mapRef.current.removeSource("temp-route");
    }

    if (routeCoords.length > 1) {
      mapRef.current.addSource("temp-route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: routeCoords }
        }
      });

      mapRef.current.addLayer({
        id: "temp-route",
        type: "line",
        source: "temp-route",
        paint: { "line-color": "#4A69BB", "line-width": 4 }
      });
    }
  }, [routeCoords]);

  // ---------------------- 스냅 경로 렌더 -------------------------
  useEffect(() => {
    if (!mapRef.current || snappedCoords.length === 0) return;

    if (mapRef.current.getSource("route")) {
      mapRef.current.removeLayer("route");
      mapRef.current.removeSource("route");
    }
    if (mapRef.current.getSource("temp-route")) {
      mapRef.current.removeLayer("temp-route");
      mapRef.current.removeSource("temp-route");
    }

    mapRef.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: snappedCoords }
      }
    });

    mapRef.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      paint: { "line-color": "#FF5500", "line-width": 5 }
    });
  }, [snappedCoords]);

  // ---------------------- 한 점 되돌리기 -------------------------
  const undoLastPoint = () => {
    setRouteCoords((prev) => prev.slice(0, -1));
  };

  // ---------------------- 전체 초기화 -------------------------
  const resetRoute = () => {
    setRouteCoords([]);
    setSnappedCoords([]);
    setDistance(0);
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    /* 임시 라인 제거 */
  if (mapRef.current?.getSource("temp-route")) {
    mapRef.current.removeLayer("temp-route");
    mapRef.current.removeSource("temp-route");
  }

  /* 스냅 라인 제거 */
  if (mapRef.current?.getSource("route")) {
    mapRef.current.removeLayer("route");
    mapRef.current.removeSource("route");
  }
  };

  // ---------------------- 경로 스냅 -------------------------
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

      const line = turf.lineString(snapped);
      const meters = Math.round(turf.length(line, { units: "kilometers" }) * 1000);
      setDistance(meters);

    } catch {
      alert("스냅 요청 오류");
    }
  };

  // ---------------------- 코스 업로드 -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!snappedCoords.length)
      return alert("경로를 완성해주세요.");
    if (!title.trim() || !region.sido || !difficulty)
      return alert("필수 항목을 입력해주세요.");

    const data = {
      route: JSON.stringify(snappedCoords),
      description: content,
      liked: 0,
      title,
      distance: Math.round((distance / 1000) * 10) / 10,
      location: `${region.sido}${region.gu ? " " + region.gu : ""}`,
      difficulty,
      type
    };

    try {
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const out = await res.json();
      if (!res.ok) throw new Error(out.message);

      alert("코스가 등록되었습니다.");
      window.history.back();
    } catch (err) {
      alert("등록 실패: " + err.message);
    }
  };

  // ---------------------- UI 렌더링 -------------------------
  return (
    <main className="route-create-container">
      <div className="create-wrapper">

        <h1 className="create-title">코스 등록하기</h1>

        <form onSubmit={handleSubmit} className="create-form">

          {/* 지도 + 버튼 */}
          <div className="form-group">
            <div className="map-control-row">
              <label className="form-label">지도에서 경로 찍기</label>

              <div className="map-btn-group">
                <button type="button" className="btn-small" onClick={undoLastPoint}>
                  되돌리기
                </button>

                <button type="button" className="btn-small" onClick={resetRoute}>
                  초기화
                </button>

                <button type="button" className="btn-small main" onClick={finishRoute}>
                  경로 완료
                </button>
              </div>
            </div>

            <div ref={mapContainer} className="mapbox-container" />

            <p className="map-desc">지도를 클릭하여 경로를 그릴 수 있습니다.</p>

            {distance > 0 && (
              <p className="distance-text">
                예상 거리: {(distance / 1000).toFixed(1)} km
              </p>
            )}
          </div>

          {/* 제목 */}
          <div className="form-group">
            <label className="form-label">
              코스 제목 <span className="required">*</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="예: 청계천 드로잉런 코스"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 메타필드 */}
          <div className="meta-fields">
            <div className="form-group">
              <label className="form-label">
                지역 <span className="required">*</span>
              </label>
              <RegionSelector onChange={(v) => setRegion(v)} />
            </div>

            <div className="form-group">
              <label className="form-label">
                난이도 <span className="required">*</span>
              </label>

              <div className="select-wrap">
                <select onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="">선택</option>
                  <option value="easy">초급</option>
                  <option value="medium">중급</option>
                  <option value="hard">고급</option>
                </select>
                <FiChevronDown className="select-arrow" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                유형 <span className="required">*</span>
              </label>

              <div className="select-wrap">
                <select onChange={(e) => setType(e.target.value)}>
                  <option value="">선택</option>
                  <option value="drawing">드로잉런</option>
                  <option value="regular">레귤러런</option>
                </select>
                <FiChevronDown className="select-arrow" />
              </div>
            </div>
          </div>

          {/* 설명 */}
          <div className="form-group">
            <label className="form-label">상세 설명</label>
            <textarea
              className="textarea-field"
              placeholder="코스 특징, 유의사항 등을 작성해주세요."
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* 버튼 */}
          <div className="create-btn-row">
            <button type="submit" className="btn-medium main" disabled={!snappedCoords.length}>
              등록하기
            </button>

            <button type="button" className="btn-medium" onClick={resetRoute}>
              취소
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default RunRoutesCreatePage;
