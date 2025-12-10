// 마이페이지 로딩 스켈레톤
import React from "react";

export default function Skeleton() {
  return (
    <main className="container mypage-wrapper">
      <div className="sidebar">
        <div className="profile-section">
          <div className="skeleton skeleton-profile" />
          <div className="skeleton skeleton-profile-small" />
        </div>

        <ul className="menu-list">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <li key={i}>
                <div className="skeleton skeleton-menu-item" />
              </li>
            ))}
        </ul>
      </div>

      <div className="main-content">
        <div className="dashboard-title-group">
          <div className="skeleton skeleton-title-large" />
          <div className="skeleton skeleton-title-medium" />
        </div>

        <h2 style={{ marginBottom: 15, marginTop: 30 }}>
          <div
            className="skeleton"
            style={{ width: "140px", height: "24px" }}
          />
        </h2>

        <div className="stats-section-grid">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i}>
                <div className="skeleton skeleton-stat-card" />
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
