// src/components/cards/LogCard.jsx
import React from "react";

export default function LogCard({
    type,          // "saved" | "record"
    item,
    isOpen,
    onMainButton,
    onDelete
}) {

    return (
        <div className="course-item">
            <div className="course-row-flex">
                {/* 왼쪽: 제목 + 메타 */}
                <div className="course-left">
                    <strong className="course-title">{item.title}</strong>

                    <div className="meta">
                        <span>📍 {item.location}</span>
                        {type === "saved" && <span>🏃 {item.level}</span>}
                        <span>📏 {item.distance}</span>
                    </div>
                </div>

                {/* 오른쪽: 버튼 / 사진 / 날짜시간 */}
                <div className="course-right">
                    {type === "record" && (
                        <>
                            <span className="photo-btn">📷 사진</span>
                            <span className="date">{item.date} 완주</span>
                            <span className="time">{item.time}</span>
                        </>
                    )}

                    {type === "saved" && (
                        <button
                            className={`btn-input ${isOpen ? "active" : ""}`}
                            onClick={onMainButton}
                        >
                            {isOpen ? "입력 닫기" : "기록 입력"}
                        </button>
                    )}

                    {type === "record" && (
                        <button className="btn-edit" onClick={onMainButton}>
                            {isOpen ? "닫기" : "수정"}
                        </button>
                    )}

                    <button className="btn-delete" onClick={onDelete}>
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
}
