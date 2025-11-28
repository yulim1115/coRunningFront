// src/components/cards/LogCard.jsx
import React from "react";

/**
 * props:
 * - type: "saved" | "record"
 * - item: { title, location, distance, level?, date?, time? }
 * - isOpen: boolean  (아래 폼 열림 여부)
 * - onMainButton: () => void
 * - onDelete: () => void
 */
export default function LogCard({ type, item, isOpen, onMainButton, onDelete }) {
  const { title, location, distance, level, date, time } = item;

  const distanceLabel =
    distance !== undefined && distance !== null ? `${distance} km` : "-";

  const isSaved = type === "saved";

  return (
    <div className="logcard-wrapper">
      <div className="logcard-main">
        <div className="logcard-info">
          <div className="logcard-title">{title}</div>

          <div className="logcard-meta">
            {location && <span className="logcard-chip">📍 {location}</span>}
            {distance && (
              <span className="logcard-chip">🏃 {distanceLabel}</span>
            )}
            {isSaved && level && (
              <span className="logcard-chip level">난이도: {level}</span>
            )}
            {!isSaved && date && (
              <span className="logcard-chip">📅 {date}</span>
            )}
            {!isSaved && time && (
              <span className="logcard-chip">⏱ {time}</span>
            )}
          </div>
        </div>

        <div className="logcard-actions">
          <button className="logcard-btn main" onClick={onMainButton}>
            {isSaved
              ? isOpen
                ? "입력 닫기"
                : "완주 기록 입력"
              : isOpen
              ? "수정 닫기"
              : "상세 / 수정"}
          </button>

          {!isSaved && (
            <button className="logcard-btn danger" onClick={onDelete}>
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
