// src/components/cards/LogCard.jsx
import React from "react";
import { FaMapMarkerAlt, FaRunning, FaRoute } from "react-icons/fa";
import "./LogCard.css";

export default function LogCard({
  type,
  item,
  isOpen,
  onMainButton,
  onDelete,
  onCancel
}) {

  const getDifficultyInfo = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    switch (diff) {
      case "easy":
        return { label: "초급", className: "difficulty-low" };
      case "medium":
      case "normal":
        return { label: "중급", className: "difficulty-mid" };
      case "hard":
        return { label: "고급", className: "difficulty-high" };
      default:
        return { label: difficulty, className: "" };
    }
  };

  return (
    <div className="logcard">

      <div className="logcard-left">
        <div className="logcard-top-row">
          <div className="logcard-title">{item.title}</div>

          {type === "record" && (
            <div className="logcard-run-inline">
              <span>{item.date}</span>
              <span className="divider"> | </span>
              <span>{item.time}</span>
            </div>
          )}
        </div>

        <div className="card-meta-details-wrapper">
          <div className="card-meta-details">
            <span>
              <FaMapMarkerAlt /> {item.location}
            </span>

            {item.level && (
              <span>
                <FaRunning />
                <span className={`difficulty-text ${getDifficultyInfo(item.level).className}`}>
                  {getDifficultyInfo(item.level).label}
                </span>
              </span>
            )}

            <span>
              <FaRoute /> {item.distance} km
            </span>
          </div>
        </div>
      </div>

      {/* 버튼 정렬 */}
      <div className="logcard-right">

      {/* 기록 입력 / 수정 */}
      <button
        className="btn btn-outline-accent btn-small btn-hover-float"
        onClick={onMainButton}
      >
        {isOpen ? "닫기" : type === "saved" ? "기록 입력" : "수정"}
      </button>

      {/* 완주 기록만 표시 */}
      {type === "record" && (
        <button
          className="btn btn-outline-danger btn-small btn-hover-float"
          onClick={onCancel}
        >
          완주 취소
        </button>
      )}

      {/* 저장한 코스일 때만 저장 해제 */}
      {type === "saved" && (
        <button
          className="btn btn-outline-soft btn-small btn-hover-float"
          onClick={onDelete}
        >
          저장 해제
        </button>
      )}
    </div>

    </div>
  );
}
