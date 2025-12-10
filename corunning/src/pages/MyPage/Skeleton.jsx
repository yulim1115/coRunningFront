// 마이페이지 로딩 스켈레톤
import React from "react";

export default function Skeleton() {
  return (
    <div className="mypage-container">
      <main className="mypage-wrapper">
        {/* 좌측 메뉴 스켈레톤 */}
        <div className="sidebar">
          <div className="profile-section">
            <div className="skeleton skeleton-avatar"></div>
            <div className="skeleton skeleton-line profile-name"></div>
          </div>

          <ul className="menu-list">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i}>
                <div className="skeleton skeleton-menu-item"></div>
              </li>
            ))}
          </ul>
        </div>

        {/* 콘텐츠 영역 스켈레톤 */}
        <div className="right-content">
          {/* 대시보드 스켈레톤 */}
          <div className="dashboard-skeleton">
            <div className="skeleton skeleton-title-large"></div>
            <div className="skeleton form-section"></div>
            <div className="stats-section-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="stat-card skeleton-stat-card" key={i}>
                  <div className="skeleton skeleton-label"></div>
                  <div className="skeleton skeleton-number"></div>
                </div>
              ))}
            </div>
          </div>

          {/* 계정 수정 스켈레톤 (대시보드 아래에 숨김) */}
          <div className="accountedit-skeleton" style={{ display: 'none' }}>
            <div className="skeleton skeleton-title-large"></div>
            <div className="skeleton skeleton-line form-section"></div>
            <div className="skeleton skeleton-input-large"></div>
            <div className="skeleton skeleton-line form-section"></div>
            <div className="skeleton skeleton-input-large"></div>
            <div className="flex-row">
              <div className="skeleton skeleton-input-medium"></div>
              <div className="skeleton skeleton-button-small"></div>
            </div>
            <div className="action-buttons">
              <div className="skeleton skeleton-button"></div>
              <div className="skeleton skeleton-button"></div>
            </div>
          </div>

          {/* 코스 관리 스켈레톤 */}
          <div className="myroutes-skeleton" style={{ display: 'none' }}>
            <div className="skeleton skeleton-title-large"></div>
            <div className="list-mini">
              {Array.from({ length: 3 }).map((_, i) => (
                <div className="item-mini" key={i}>
                  <div>
                    <div className="title-row-mini">
                      <div className="skeleton skeleton-line title-mini"></div>
                    </div>
                    <div className="meta-row-mini">
                      <div className="skeleton skeleton-label small"></div>
                      <div className="skeleton skeleton-label small"></div>
                      <div className="skeleton skeleton-label small"></div>
                    </div>
                  </div>
                  <div className="skeleton skeleton-button-icon"></div>
                </div>
              ))}
            </div>
          </div>

          {/* 크루 관리 스켈레톤 */}
          <div className="crew-skeleton" style={{ display: 'none' }}>
            <div className="skeleton skeleton-title-large"></div>
            <div className="list-mini">
              {Array.from({ length: 2 }).map((_, i) => (
                <div className="item-mini" key={i}>
                  <div className="skeleton skeleton-line title-mini"></div>
                  <div className="skeleton skeleton-button-icon"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
