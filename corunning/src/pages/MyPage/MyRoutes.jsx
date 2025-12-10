import React from "react";
import { FaMapMarkerAlt, FaRoute, FaRunning, FaTrash } from "react-icons/fa";

export default function MyRoutes({
  routes,
  getDifficultyInfo,
  deleteRoute,
  navigate,
}) {
  return (
    <div id="myroutes" className="content-block active">
      <div className="myroutes-title-group">
        <h1>코스 관리</h1>
      </div>

      <h3 className="route-count">총 {routes.length}개의 코스 등록</h3>

      <section className="list-mini">
        {routes.map((route) => (
          <div className="card-base item-mini" key={route.route_id}>
            {/* 내용 클릭 영역 */}
            <div
              className="card-info"
              onClick={() => navigate(`/routes/${route.route_id}`)}
            >
              <div className="title-row-mini">
                <h3>{route.title}</h3>
                <div
                  className={`tag tag-small ${
                    route.type === "drawing" ? "tag-drawing" : "tag-regular"
                  }`}
                >
                  {route.type === "drawing" ? "드로잉런" : "레귤러런"}
                </div>
              </div>

              <div className="meta-row-mini">
                <span>
                  <FaMapMarkerAlt /> {route.location}
                </span>
                <span>
                  <FaRunning />
                  {getDifficultyInfo(route.difficulty).label}
                </span>
                <span>
                  <FaRoute /> {route.distance} km
                </span>
              </div>
            </div>

            {/* 삭제 버튼 */}
            <div className="myroute-actions">
              <button
                className="btn btn-small btn-outline-danger"
                onClick={() => deleteRoute(route.route_id)}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
