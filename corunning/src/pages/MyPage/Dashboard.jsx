// 러닝 통계 대시보드
import React from "react";

export default function Dashboard({
  dashboards,
  userName,
  getTotalRecordTime,
}) {
  return (
    <div id="dashboard" className="content-block active">
      <div className="dashboard-title-group">
        <h1>러닝 통계 대시보드</h1>
      </div>

      <h3 className="stats-section-title">누적 기록</h3>

      <div className="stats-section-grid">
        <div className="stat-card">
          <p>총 달린 거리</p>
          <h1>{getTotalRecordTime(dashboards)[1]} KM</h1>
        </div>

        <div className="stat-card">
          <p>완주 횟수</p>
          <h1>{dashboards.length} 회</h1>
        </div>

        <div className="stat-card">
          <p>러닝 시간</p>
          <h1>{getTotalRecordTime(dashboards)[0]}</h1>
        </div>

        <div className="stat-card">
          <p>평균 페이스</p>
          <h1>
            {isNaN(getTotalRecordTime(dashboards)[2])
              ? 0
              : getTotalRecordTime(dashboards)[2]}
            ′
            {isNaN(getTotalRecordTime(dashboards)[3])
              ? 0
              : getTotalRecordTime(dashboards)[3]}
            ″
          </h1>
        </div>
      </div>
    </div>
  );
}
