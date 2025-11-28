// src/pages/Home/HomePage.jsx

import React from "react";
import "./HomePage.css";

import {
  FaPlusCircle,
  FaUndo,
  FaImage,
  FaCopy,
  FaMapMarkerAlt,
  FaRoute,
  FaShoePrints,
  FaHeart,
  FaListAlt,
  FaPenNib,
  FaUsers,
  FaTrophy,
} from "react-icons/fa";

function HomePage() {
  const popularCourses = [
    {
      id: 1,
      title: "여의도 한강 공원 힐링 런",
      type: "드로잉런",
      region: "영등포구",
      distance: "7.2 KM",
      difficulty: "초급",
      likes: 345,
    },
    {
      id: 2,
      title: "남산 팔각정 정복 챌린지",
      type: "레귤러런",
      region: "용산구",
      distance: "8.8 KM",
      difficulty: "고급",
      likes: 288,
    },
    {
      id: 3,
      title: "부산 광안리 야경 로맨틱 런",
      type: "야간런",
      region: "부산 수영구",
      distance: "5.0 KM",
      difficulty: "중급",
      likes: 251,
    },
    {
      id: 4,
      title: "석촌호수 벚꽃 런 랩",
      type: "레귤러런",
      region: "서울 송파구",
      distance: "2.5 KM",
      difficulty: "초급",
      likes: 210,
    },
  ];

  return (
    <main className="home-wrapper">

      {/* 배너 */}
      <section className="hero-banner">
        <div className="hero-inner">
          <h1>나만의 러닝 코스를 만들고 공유해보세요!</h1>
          <p>클릭 및 드로잉으로 새로운 러닝 루트를 설계하고, 친구들과 공유하며 새로운 러닝의 재미를 발견하세요.</p>
        </div>
      </section>

      {/* 러닝 코스 생성 + 인기코스 */}
      <section className="route-and-popular">
        <div className="route-and-popular-inner">

          {/* 왼쪽: 코스 생성 */}
          <div className="route-create-area">
            <h2>러닝 코스 생성</h2>

            <div className="create-btn-row">
              <button className="create-btn main"><FaPlusCircle /> 코스 생성</button>
              <button className="create-btn"><FaUndo /> 되돌리기</button>
              <button className="create-btn"><FaImage /> 이미지 다운로드</button>
              <button className="create-btn"><FaCopy /> 경로 복사</button>
            </div>

            <div className="map-placeholder">
              여기에 지도가 표시됩니다 (카카오맵 API 예정)
            </div>
          </div>

          {/* 오른쪽: 인기코스 */}
          <div className="popular-courses-area">
            <div className="popular-header">
              <h2>추천 인기 코스</h2>
              <span className="toprun-badge">TOP RUN</span>
            </div>

            <div className="popular-list">
              {popularCourses.map((item, index) => (
                <div className={`popular-item ${index === 0 ? "first" : ""}`} key={item.id}>
                  <div className="pop-info">
                    <div className="pop-title-row">
                      <h4>{item.title}</h4>
                      <span className="pop-tag">{item.type}</span>
                    </div>

                    <div className="pop-meta">
                      <span><FaMapMarkerAlt /> {item.region}</span>
                      <span><FaRoute /> {item.distance}</span>
                      <span><FaShoePrints /> {item.difficulty}</span>
                    </div>
                  </div>

                  <div className="pop-likes">
                    <FaHeart /> {item.likes}
                  </div>
                </div>
              ))}
            </div>

            <button className="more-btn">
              <FaListAlt /> 더 많은 코스 보러가기
            </button>
          </div>
        </div>
      </section>

      {/* 왜 coRunning? */}
      <section className="value-section">
        <div className="value-inner">
          <h2 className="value-title">왜 coRunning을 선택해야 할까요?</h2>
          <p className="value-subtitle">단순한 지도 서비스가 아닌, 러닝 경험의 모든 것을 연결합니다.</p>

          <div className="value-cards">
            <div className="value-card">
              <FaPenNib className="value-icon" />
              <h3>1. CREATE: 창의적인 경로</h3>
              <p>클릭과 드로잉으로 코스를 쉽게 만들고 이미지 저장까지 가능합니다.</p>
              <button className="value-btn">코스 생성 시작하기</button>
            </div>

            <div className="value-card">
              <FaUsers className="value-icon" />
              <h3>2. CONNECT: 크루와 함께</h3>
              <p>지역별, 난이도별 크루를 찾고 함께 달릴 수 있습니다.</p>
              <button className="value-btn">크루 찾아보기</button>
            </div>

            <div className="value-card">
              <FaTrophy className="value-icon" />
              <h3>3. ACHIEVE: 기록 관리</h3>
              <p>완주 기록을 체계적으로 저장하고 통계를 확인하세요.</p>
              <button className="value-btn">내 기록 확인하기</button>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

export default HomePage;
