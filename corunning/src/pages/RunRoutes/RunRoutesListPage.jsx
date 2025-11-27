import React from "react";
import "./RunRoutesPage.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRoute,
  faMagnifyingGlass,
  faMapMarkerAlt,
  faPersonRunning,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

const sampleRoutes = [
  {
    id: 1,
    title: "청계천 따라 달리기",
    type: "drawing",
    region: "서울 종로구",
    difficulty: "초급",
    distance: "6.5 KM",
    likes: 123,
  },
  {
    id: 2,
    title: "남산 팔각정 정복",
    type: "regular",
    region: "서울 용산구",
    difficulty: "고급",
    distance: "8.8 KM",
    likes: 45,
  },
  {
    id: 3,
    title: "광안리 해변 힐링 런 - 제목이 아주 길어지는 케이스",
    type: "drawing",
    region: "부산 수영구",
    difficulty: "초급",
    distance: "5.0 KM",
    likes: 201,
  },
];

function RunRoutesListPage() {
  return (
    <main className="routes-container">
      <section className="page-header-area">
        <h1>Run Routes</h1>
      </section>

      <div className="registration-notice">
        <p>나만의 특별한 러닝 코스를 공유하고 싶으신가요?</p>
        <button className="register-course-btn">
          <FontAwesomeIcon icon={faRoute} /> &nbsp; 코스 등록하기
        </button>
      </div>

      {/* 필터 */}
      <section className="filter-controls-area">
        <div className="filter-group-wrapper">
          <div className="filter-group">
            <label>정렬</label>
            <div className="custom-select">
              <select>
                <option>최신순</option>
                <option>인기순</option>
              </select>
            </div>
          </div>

          <div className="filter-group">
            <label>지역</label>
            <div className="custom-select">
              <select>
                <option>전체 지역</option>
                <option>서울</option>
                <option>경기</option>
              </select>
            </div>
          </div>

          <div className="filter-group">
            <label>난이도</label>
            <div className="custom-select">
              <select>
                <option>전체 난이도</option>
                <option>초급</option>
                <option>중급</option>
                <option>고급</option>
              </select>
            </div>
          </div>

          <div className="filter-group">
            <label>타입</label>
            <div className="custom-select">
              <select>
                <option>전체 타입</option>
                <option>드로잉런</option>
                <option>레귤러런</option>
              </select>
            </div>
          </div>

          <button className="search-button">
            <FontAwesomeIcon icon={faMagnifyingGlass} /> &nbsp; 조회
          </button>
        </div>

        <p className="route-count">총 {sampleRoutes.length}개의 코스</p>
      </section>

      {/* 리스트 */}
      <section className="route-list">
        {sampleRoutes.map((route) => (
          <div className="route-item" key={route.id}>
            <div className="route-card-content">
              <div className="card-title-group">
                <h3>{route.title}</h3>

                <div
                  className={
                    route.type === "drawing"
                      ? "course-tag drawing"
                      : "course-tag regular"
                  }
                >
                  {route.type === "drawing" ? "드로잉런" : "레귤러런"}
                </div>
              </div>
            </div>

            <div className="card-meta-details-wrapper">
              <div className="card-meta-details">
                <span>
                  <FontAwesomeIcon icon={faMapMarkerAlt} /> {route.region}
                </span>

                <span>
                  <FontAwesomeIcon icon={faPersonRunning} />
                  <span
                    className={`difficulty-text ${
                      route.difficulty === "초급"
                        ? "difficulty-low"
                        : route.difficulty === "중급"
                        ? "difficulty-mid"
                        : "difficulty-high"
                    }`}
                  >
                    {route.difficulty}
                  </span>
                </span>

                <span>
                  <FontAwesomeIcon icon={faRoute} /> {route.distance}
                </span>
              </div>

              <span className="likes">
                <FontAwesomeIcon icon={faHeart} /> {route.likes}
              </span>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

export default RunRoutesListPage;
