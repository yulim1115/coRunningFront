import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import RegionSelector from "../../components/common/RegionSelector";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function RunRoutesCreatePage() {
    const [routeCoords, setRouteCoords] = useState([]);
    const [snappedCoords, setSnappedCoords] = useState([]);
    const [distance, setDistance] = useState(0);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [region, setRegion] = useState({ sido: "", gu: "" });
    const [difficulty, setDifficulty] = useState("");
    const [type, setType] = useState("running");
    
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);

    // 맵 초기화
    useEffect(() => {
        if (mapRef.current) return;
        
        mapRef.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [126.9784, 37.5665],
            zoom: 12,
            attributionControl: false,
            language: "ko",
        });

        mapRef.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

        mapRef.current.on("load", () => {
            mapRef.current.on("click", (e) => {
                const lngLat = e.lngLat;
                setRouteCoords((prev) => [...prev, [lngLat.lng, lngLat.lat]]);
            });
        });
    }, []);

    // 마커와 임시 라인 업데이트
    useEffect(() => {
        if (!mapRef.current) return;

        // 기존 마커 제거
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        routeCoords.forEach((point, idx) => {
            const el = document.createElement("div");
            el.style.cssText = `
                background: #FF5500;
                color: white;
                border-radius: 50%;
                width: 16px;
                height: 16px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 10px;
                font-weight: 700;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                line-height: 16px;
                text-align: center;
            `;
            
            const num = idx + 1;
            el.innerHTML = num;
            
            const marker = new mapboxgl.Marker(el, { draggable: true })
                .setLngLat(point)
                .addTo(mapRef.current);

            marker.on("dragend", () => {
                const newPos = marker.getLngLat();
                setRouteCoords((prev) => {
                    const copy = [...prev];
                    copy[idx] = [newPos.lng, newPos.lat];
                    return copy;
                });
            });

            markersRef.current.push(marker);
        });

        // 기존 임시 라인 제거
        if (mapRef.current.getSource("temp-route")) {
            mapRef.current.removeLayer("temp-route");
            mapRef.current.removeSource("temp-route");
        }

        if (routeCoords.length > 1) {
            mapRef.current.addSource("temp-route", {
                type: "geojson",
                data: {
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: routeCoords,
                    },
                },
            });
            mapRef.current.addLayer({
                id: "temp-route",
                type: "line",
                source: "temp-route",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": "#007bff", "line-width": 4 },
            });
        }
    }, [routeCoords]);

    // 스냅된 최종 경로 표시
    useEffect(() => {
        if (!mapRef.current || snappedCoords.length === 0) return;

        // 기존 라인 모두 제거
        if (mapRef.current.getSource("route")) {
            mapRef.current.removeLayer("route");
            mapRef.current.removeSource("route");
        }
        if (mapRef.current.getSource("temp-route")) {
            mapRef.current.removeLayer("temp-route");
            mapRef.current.removeSource("temp-route");
        }

        // 스냅된 경로 표시 (주황색, 굵게)
        mapRef.current.addSource("route", {
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: snappedCoords,
                },
            },
        });
        mapRef.current.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#FF5500", "line-width": 5 },
        });
    }, [snappedCoords]);

    const undoLastPoint = () => {
        setRouteCoords((prev) => (prev.length ? prev.slice(0, -1) : prev));
    };

    const resetRoute = () => {
        setRouteCoords([]);
        setSnappedCoords([]);
        setDistance(0);
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    };

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

          {/* 지역 / 난이도 / 유형 */}
          <div className="meta-fields">
            <div className="form-group">
              <label className="form-label">
                지역 <span className="required">*</span>
              </label>
              <RegionSelector onChange={(v) => setRegion(v)} />
            </div>

        const coordsString = routeCoords.map((c) => `${c[0]},${c[1]}`).join(";");
        const url = `https://api.mapbox.com/matching/v5/mapbox/walking/${coordsString}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (!data.matchings || data.matchings.length === 0) {
                alert("스냅 경로 생성 실패");
                console.error(data);
                return;
            }

            const snapped = data.matchings[0].geometry.coordinates;
            setSnappedCoords(snapped);

            // 거리 계산 (km -> m)
            const line = turf.lineString(snapped);
            const distanceInMeters = Math.round(turf.length(line, { units: 'kilometers' }) * 1000);
            setDistance(distanceInMeters);

        } catch (err) {
            console.error(err);
            alert("스냅 요청 중 오류가 발생했습니다.");
        }
    };

    // 코스 등록 제출
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (snappedCoords.length < 2) {
            alert("경로를 완성한 후 등록해주세요.");
            return;
        }
        if (!title.trim() || !region.sido || !difficulty) {
            alert("제목, 지역, 난이도는 필수입니다.");
            return;
        }

        // 서버 엔티티와 정확히 매핑
        const routeData = {
            route: JSON.stringify(snappedCoords),
            description: content || "",
            liked : 0,
            title: title.trim(),
            distance: Math.round(distance / 1000 * 10) / 10, // km, 소수점 1자리
            location: `${region.sido}${region.gu ? ' ' + region.gu : ''}`.trim(), // ✅ location 필드 추가
            difficulty: difficulty,  // ✅
            type: type              // ✅
        };

        console.log("전송 데이터:", routeData); // 디버깅용

        try {
            const response = await fetch("/api/routes", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(routeData),
            });

            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || "코스 업로드 실패");
            }

            alert("코스가 성공적으로 등록되었습니다!");
            window.history.back();
            
        } catch (error) {
            console.error("코스 업로드 오류:", error);
            alert(`코스 등록 실패: ${error.message}`);
        }
    };


    return (
        <main className="container">
            <div className="registration-wrapper">
                <h1 className="page-title">
                    <i className="fas fa-route" style={{ color: "#4A69BB" }}></i> 코스 등록하기
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between", 
                            gap: 8 
                        }}>
                            <label style={{ margin: 0 }}>지도에서 경로 찍기</label>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button type="button" className="cancel-btn" onClick={undoLastPoint}>
                                    되돌리기
                                </button>
                                <button type="button" className="cancel-btn" onClick={resetRoute}>
                                    경로 초기화
                                </button>
                                <button type="button" className="register-btn" onClick={finishRoute}>
                                    경로 완료
                                </button>
                            </div>
                        </div>

                        <div 
                            ref={mapContainer} 
                            className="mapbox-container" 
                            style={{ 
                                width: "100%", 
                                height: "300px", 
                                borderRadius: "8px", 
                                marginTop: "10px", 
                                marginBottom: "10px" 
                            }} 
                        />
                        <p className="extra-small" style={{ color: "#AAAAAA", textAlign: "right" }}>
                            지도를 클릭하여 경로를 그릴 수 있습니다. (드래그로 위치 조정 가능)
                        </p>
                        {distance > 0 && (
                            <p style={{ color: "#FF5500", fontWeight: "bold", textAlign: "right" }}>
                                예상 거리: {(distance / 1000).toFixed(1)} km
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">코스 제목 <span style={{color: 'red'}}>*</span></label>
                        <input 
                            type="text" 
                            id="title" 
                            placeholder="예: 청계천을 따라 달리는 드로잉 런 코스"
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="meta-fields">
                        <div className="form-group">
                            <label htmlFor="region">지역 <span style={{color: 'red'}}>*</span></label>
                            <RegionSelector 
                                onChange={(selected) => setRegion(selected)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="difficulty">난이도 <span style={{color: 'red'}}>*</span></label>
                            <select 
                                id="difficulty"
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="">난이도 선택</option>
                                <option value="easy">초급</option>
                                <option value="medium">중급</option>
                                <option value="hard">고급</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="type">코스유형 <span style={{color: 'red'}}>*</span></label>
                            <select 
                                id="type"
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="" disabled hidden>유형 선택</option>
                                <option value="drawing">드로잉</option>
                                <option value="normal">일반</option>
                                <option value="walk">산책</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">상세 설명</label>
                        <textarea 
                            id="description"
                            placeholder="코스의 특징, 유의사항, 추천 시간대 등을 자세히 적어주세요."
                            rows={5}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    <div className="action-buttons">
                        <button type="submit" className="register-btn" disabled={!snappedCoords.length}>
                            코스 등록 완료
                        </button>
                        <button type="button" className="cancel-btn" onClick={resetRoute}>
                            취소
                        </button>
                    </div>
                </form>
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

          {/* 등록/취소 버튼 */}
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
