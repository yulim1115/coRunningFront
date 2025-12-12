import React from "react";
import { FaMapMarkerAlt, FaRegCalendarCheck, FaUsers } from "react-icons/fa";

export default function MyCrew({
  crews,
  navigate,
  openApplicants,
  deleteCrew,
  openCheck,
  selectedCrew,
  crewApplications,
  handleCloseApplications,
}) {
  return (
    <div id="mycrews" className="content-block active">
      <div className="crew-title-group">
        <h1>크루 모집 관리</h1>
      </div>

      <h3 className="crew-count">총 {crews.length}개의 크루 모집</h3>

      <section className="list-mini">
        {crews.map((crew) => (
          <div className="card-base item-mini" key={crew.id}>
            <div
              className="card-info"
              onClick={() => navigate(`/crews/${crew.id}`)}
            >
              <div className="title-row-mini">
                <h3>{crew.title}</h3>

                <div
                  className={`tag tag-small ${
                    crew.boardType === "DRAWING"
                      ? "tag-drawing"
                      : crew.boardType === "FLASH"
                      ? "tag-flash"
                      : "tag-regular"
                  }`}
                >
                  {crew.boardType === "DRAWING"
                    ? "드로잉"
                    : crew.boardType === "FLASH"
                    ? "번개"
                    : "정기"}
                </div>
              </div>

              <div className="meta-row-mini">
                <span>
                  <FaMapMarkerAlt /> {crew.region || "지역 미정"}
                </span>
                <span>
                  <FaUsers /> {crew.currentCount} / {crew.recruitCount} 명
                </span>
                <span>
                  <FaRegCalendarCheck /> {crew.deadline}
                </span>
              </div>
            </div>

            <div className="crew-actions">
              <button
                className="btn btn-small btn-outline-accent"
                onClick={() => openApplicants(crew)}
              >
                신청자
              </button>

              <button
                className="btn btn-small btn-outline-soft"
                onClick={() => navigate(`/crews/modify/${crew.id}`)}
              >
                수정
              </button>

              <button
                className="btn btn-small btn-outline-danger"
                onClick={() => deleteCrew(crew.id)}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* 모달 영역 */}
      {openCheck && (
        <div className="modal-overlay" onClick={handleCloseApplications}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              {selectedCrew && `${selectedCrew.title}`} (신청자 명단)
            </div>

            {crewApplications.length === 0 ? (
              <p className="modal-empty">아직 신청자가 없습니다.</p>
            ) : (
              <ul className="application-list">
                {crewApplications.map((app) => (
                  <li key={app.id} className="application-item">
                    <div>이름 : {app.applicantName}</div>
                    <div>이메일 : {app.applicantId}</div>
                  </li>
                ))}
              </ul>
            )}

            <button
              className="btn btn-small btn-soft"
              onClick={handleCloseApplications}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
