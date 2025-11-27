// src/pages/RunRoutes/RunRoutesDetailPage.jsx

import React from "react";
import "./RunRoutesDetailPage.css";

import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaRunning,
  FaRoute,
  FaUser,
  FaThumbsUp,
  FaBookmark,
} from "react-icons/fa";

function RunRoutesDetailPage() {
  return (
    <main className="detail-page">

      {/* 🔙 목록으로 돌아가기 */}
      {/* <div className="back-link-wrapper">
        <a href="/routes" className="back-link">
          <FaArrowLeft /> 목록으로 돌아가기
        </a>
      </div> */}

      {/* 제목 영역 */}
      <section className="title-section">

        <div className="title-row">
          <h1 className="route-title">청계천 따라 달리기</h1>

          {/* 리스트 페이지 태그와 동일 */}
          <div className="course-tag drawing">드로잉런</div>
        </div>

        <div className="meta-row">
          <span><FaMapMarkerAlt /> 서울 종로구</span>
          <span><FaRunning /> 초급</span>
          <span><FaRoute /> 6.5 KM</span>
          <span><FaUser /> 작성자: 황떡배 님</span>
        </div>
      </section>

      {/* 메인 2단 레이아웃 */}
      <section className="main-layout">
        
        {/* 왼쪽: 지도 */}
        <div className="left-area">
          <div className="map-box">Running Route Map Placeholder</div>
        </div>

        {/* 오른쪽: 추천/저장 + 소개 */}
        <div className="right-area">

          <div className="recommend-row">
            <button className="action-btn"><FaThumbsUp /> 추천 (123)</button>
            <button className="action-btn"><FaBookmark /> 저장 (45)</button>
          </div>

          <div className="course-summary-box">
            <h2>코스 소개</h2>
            <p>
              맑은 청계천을 따라 상쾌하게 달릴 수 있는 힐링 러닝 코스입니다.
            </p>
            <p>
              초보자도 부담 없는 평탄한 코스로, 시원한 물소리와 함께 도심 속 힐링을 느낄 수 있어요.
            </p>
          </div>

        </div>

      </section>

      {/* 댓글 영역 */}
      <section className="comment-section">

        <h2 className="comment-title">댓글 (3개)</h2>

        <div className="comment-input-row">
          <input type="text" placeholder="이 코스에 대한 답글을 남겨주세요.." />
          <button className="comment-submit-btn">등록</button>
        </div>

        <div className="comment-list">

          <div className="comment-item">
            <div className="comment-meta">
              <strong>정떡덕</strong>
              <span className="date">2025.11.26</span>
            </div>
            <p className="comment-text">
              깔끔하고 달리기도 편했어요! 다음에도 또 이용할게요.
            </p>
          </div>

          <div className="comment-item">
            <div className="comment-meta">
              <strong>러너123</strong>
              <span className="date">2025.11.24</span>
            </div>
            <p className="comment-text">
              코스 등록 감사합니다. 맵이 너무 보기 좋아요!
            </p>
          </div>

          <div className="comment-item">
            <div className="comment-meta">
              <strong>coRunning운영진</strong>
              <span className="date">2025.11.25</span>
            </div>
            <p className="comment-text">
              좋은 코스 등록 감사합니다! 앞으로 더 많은 코스 제공할게요 😄
            </p>
          </div>

        </div>

      </section>

      {/* 목록으로 돌아가기 */}
      <div className="bottom-btn-wrapper">
        <a href="/routes" className="back-list-btn">목록으로</a>
      </div>

    </main>
  );
}

export default RunRoutesDetailPage;
