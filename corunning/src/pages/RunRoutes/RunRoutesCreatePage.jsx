import "./RunRoutesPage.css";
import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf"; // npm install @turf/turf

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function RunRoutesCreatePage(){
    const [routeCoords, setRouteCoords] = useState([]);
    const [snappedCoords, setSnappedCoords] = useState([]);
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);

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

        mapRef.current.on("click", (e) => {
            const lngLat = e.lngLat;
            setRouteCoords((prev) => [...prev, [lngLat.lng, lngLat.lat]]);
        });
    }, []);

    // 마커와 라인 업데이트
    useEffect(() => {
        if (!mapRef.current) return;

        // 기존 마커 제거
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        routeCoords.forEach((point, idx) => {
            const el = document.createElement("div");
            // 스타일을 cssText로 한 번에 설정
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
                line-height: 32px;
                text-align: center;
            `;
            
            // 번호 설정 - innerHTML과 textContent 모두 사용
            const num = idx + 1;
            el.innerHTML = num;
            el.textContent = num;
            
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

        // 기존 라인 제거
        if (mapRef.current.getSource("route")) {
            mapRef.current.removeLayer("route");
            mapRef.current.removeSource("route");
        }

        if (routeCoords.length > 1) {
            mapRef.current.addSource("route", {
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
                id: "route",
                type: "line",
                source: "route",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": "#007bff", "line-width": 4 },
            });
        }
    }, [routeCoords]);

    // 스냅된 경로 표시
    useEffect(() => {
        if (!mapRef.current || snappedCoords.length === 0) return;

        if (mapRef.current.getSource("route")) {
            mapRef.current.removeLayer("route");
            mapRef.current.removeSource("route");
        }

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
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    };

    const finishRoute = async () => {
        if (routeCoords.length < 2) {
            alert("경로가 너무 짧습니다.");
            return;
        }

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

            // 거리 계산
            const line = turf.lineString(snapped);
            const distanceInMeters = Math.round(turf.length(line, { units: 'kilometers' }) * 1000);
            
            // 거리 입력 필드 자동 채우기
            const distanceInput = document.getElementById('distance');
            if (distanceInput) {
                distanceInput.value = (distanceInMeters / 1000).toFixed(1);
            }
        } catch (err) {
            console.error(err);
            alert("스냅 요청 중 오류가 발생했습니다.");
        }
    };

    return (
        <main className="container">
            <div className="registration-wrapper">
                <h1 className="page-title">
                    <i className="fas fa-route" style={{ color: "#4A69BB" }}></i> 코스 등록하기
                </h1>

                <form action="#" method="post">
                    <div className="form-group">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                            <label style={{ margin: 0 }}>지도에서 경로 찍기</label>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button type="button" className="cancel-btn" onClick={undoLastPoint}>
                                    되돌리기
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={resetRoute}
                                >
                                    경로 초기화
                                </button>
                                <button type="button" className="register-btn" onClick={finishRoute}>
                                    경로 완료
                                </button>
                            </div>
                        </div>

                        <div ref={mapContainer} className="mapbox-container" style={{ width: "100%", height: "300px", borderRadius: "8px", marginTop: "10px", marginBottom: "10px" }} />
                        <p className="extra-small" style={{ color: "#AAAAAA", textAlign: "right" }}>
                            지도를 클릭하여 경로를 그릴 수 있습니다. (드래그로 위치 조정 가능)
                        </p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">코스 제목 <span>*</span></label>
                        <input type="text" id="title" placeholder="예: 청계천을 따라 달리는 드로잉 런 코스" required/>
                    </div>

                    <div className="meta-fields">
                        <div className="form-group">
                            <label htmlFor="region">지역 <span>*</span></label>
                            <select id="region" required>
                                <option value="">지역 선택</option>
                                <option value="seoul">서울</option>
                                <option value="gyeonggi">경기</option>
                                <option value="busan">부산</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="difficulty">난이도 <span>*</span></label>
                            <select id="difficulty" required>
                                <option value="">난이도 선택</option>
                                <option value="easy">초급</option>
                                <option value="medium">중급</option>
                                <option value="hard">고급</option>
                            </select>
                        </div>
                    </div>

                    <div className="meta-fields">
                        <div className="form-group">
                            <label htmlFor="distance">거리 (KM)</label>
                            <input type="text" id="distance" placeholder="예: 6.5"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="time">예상 시간 (분)</label>
                            <input type="text" id="time" placeholder="예: 40"/>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">상세 설명</label>
                        <textarea id="description" placeholder="코스의 특징, 유의사항, 추천 시간대 등을 자세히 적어주세요."></textarea>
                    </div>

                    <div className="action-buttons">
                        <button type="submit" className="register-btn">코스 등록 완료</button>
                        <button type="button" className="cancel-btn">취소</button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default RunRoutesCreatePage;
