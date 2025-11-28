// src/components/cards/LogCard.jsx
import React from "react";

export default function LogCard({
  type,       // 'saved' | 'record'
  item,
  isOpen,
  onMainButton,
  onDelete
}) {
  return (
    <div className="logcard">
      <div className="logcard-left">
        <div className="logcard-title">
          {item.title}
        </div>

        <div className="logcard-meta">
          {item.location && <span>📍 {item.location}</span>}
          {item.distance && <span>🏃 {item.distance} km</span>}
          {item.level && type === "saved" && <span>🔥 {item.level}</span>}
        </div>

        {type === "record" && (
          <div className="logcard-run-info">
            <span className="run-date">{item.date}</span>
            <span className="run-time">{item.time}</span>
          </div>
        )}
      </div>

      <div className="logcard-right">
        <button className="btn-main" onClick={onMainButton}>
          {isOpen ? "닫기" : type === "saved" ? "기록 입력" : "수정"}
        </button>

        {type === "record" && (
          <button className="btn-danger" onClick={onDelete}>
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
