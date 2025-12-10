// 러닝 통계 대시보드
import React from "react";

export default function Dashboard({ dashboards, userName }) {
  function getTotalRecordTime(dashboards) {
    if (!Array.isArray(dashboards)) return ["00:00:00", 0, 0, "00"];

    let totalSeconds = 0;
    let totalDistance = 0;

    dashboards.forEach((d) => {
      const timeStr = d.record.split(" ")[1];
      const [h, m, s] = timeStr.split(":").map(Number);
      const sec = h * 3600 + m * 60 + s;
      totalSeconds += sec;
      totalDistance += d.distance;
    });

    const HH = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const MM = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const SS = String(totalSeconds % 60).padStart(2, "0");

    const avgPaceSec = totalDistance > 0 ? totalSeconds / totalDistance : 0;
    const paceM = Math.floor(avgPaceSec / 60);
    const paceS = String(Math.floor(avgPaceSec % 60)).padStart(2, "0");

    return [`${HH}:${MM}:${SS}`, totalDistance, paceM, paceS];
  }

  const [totalTime, totalDistance, paceM, paceS] =
    getTotalRecordTime(dashboards);

  return (
    <div id="dashboard" className="content-block active">
      <div className="dashboard-title-group">
        <h1>러닝 통계 대시보드</h1>
      </div>

      <h3 className="stats-section-title">누적 기록</h3>

      <div className="stats-section-grid">
        <div className="stat-card">
          <p>총 달린 거리</p>
          <h1>{totalDistance} KM</h1>
        </div>

        <div className="stat-card">
          <p>완주 횟수</p>
          <h1>{dashboards.length} 회</h1>
        </div>

        <div className="stat-card">
          <p>러닝 시간</p>
          <h1>{totalTime}</h1>
        </div>

        <div className="stat-card">
          <p>평균 페이스</p>
          <h1>
            {isNaN(paceM) ? 0 : paceM}′{isNaN(paceS) ? "00" : paceS}″
          </h1>
        </div>
      </div>
    </div>
  );
}
