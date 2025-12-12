/* CrewCreatePage.jsx */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CrewCreatePage.css";
import RegionSelector from "../../components/common/RegionSelector";
import { crewCreateAPI } from "../../api/crewApi";
import { FiChevronDown } from "react-icons/fi";

const showSuccess = (msg) => {
  window.Swal.fire({
    icon: "success",
    title: "성공",
    text: msg,
  });
};

const showError = (msg) => {
  window.Swal.fire({
    icon: "error",
    title: "오류",
    text: msg,
  });
};

function CrewCreatePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [routePath, setRoutePath] = useState("");
  const [region, setRegion] = useState({ sido: "", gu: "" });
  const [boardType, setBoardType] = useState("");
  const [recruitCount, setRecruitCount] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    document.body.style.backgroundColor = "var(--color-bg-light)";
    return () => {
      document.body.style.backgroundColor = "var(--color-bg)";
    };
  }, []);

  const isDisabled =
    !title.trim() ||
    !content.trim() ||
    !region.sido ||
    !boardType ||
    !recruitCount ||
    !deadline;
  // 로그인 상태 확인
  useEffect(() => {
    const isLogin = sessionStorage.getItem("isLogin") === "true";
    if (!isLogin) {
      showError("코스 등록은 로그인 후 이용 가능합니다.");
      navigate("/login");
      return null;
    }
  }, [navigate]);
  // 등록 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      title,
      content,
      routePathJson: routePath,
      region: `${region.sido} ${region.gu}`,
      boardType,
      recruitCount,
      deadline,
    };

    try {
      await crewCreateAPI(data);
      showSuccess("크루 모집 글이 등록되었습니다!");
      navigate("/crews");
    } catch {
      showError("등록 실패. 다시 시도해주세요.");
    }
  };

  return (
    <main className="crew-create-container">
      <div className="create-wrapper">
        <h1 className="create-title">크루 모집 등록</h1>

        <form onSubmit={handleSubmit} className="create-form">
          {/* 제목 */}
          <div className="form-group">
            <label className="form-label">
              모집 글 제목 <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="예 : 서울 야경 명소 크루, '@@@' 모집"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 내용 */}
          <div className="form-group">
            <label className="form-label">
              모집 글 내용 <span className="required">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="크루 소개, 준비물, 시간 등을 작성하세요."
            />
          </div>

          {/* 추천 코스 JSON */}
          <div className="form-group">
            <label className="form-label">추천 코스 데이터 업로드 (선택)</label>
            <textarea
              value={routePath}
              onChange={(e) => setRoutePath(e.target.value)}
              placeholder="RunRoutes에서 생성한 경로 JSON을 넣을 수 있습니다."
            />
          </div>

          {/* 지역 1줄 */}
          <div className="meta-fields single">
            <div className="form-group full">
              <label className="form-label">
                지역 <span className="required">*</span>
              </label>
              <RegionSelector onChange={(v) => setRegion(v)} />
            </div>
          </div>

          {/* 타입 / 인원 / 마감일 */}
          <div className="meta-fields triple">
            {/* 타입 */}
            <div className="form-group">
              <label className="form-label">
                타입 <span className="required">*</span>
              </label>
              <div className="custom-select">
                <select
                  value={boardType}
                  onChange={(e) => setBoardType(e.target.value)}
                >
                  <option value="">선택</option>
                  <option value="NORMAL">정기 러닝</option>
                  <option value="DRAWING">드로잉 러닝</option>
                  <option value="FLASH">번개 러닝</option>
                </select>
                <FiChevronDown className="select-arrow" />
              </div>
            </div>

            {/* 모집 인원 */}
            <div className="form-group">
              <label className="form-label">
                모집 인원 <span className="required">*</span>
              </label>
              <input
                type="number"
                placeholder="예: 10"
                min="1"
                value={recruitCount}
                onChange={(e) => setRecruitCount(e.target.value)}
              />
            </div>

            {/* 모집 마감일 */}
            <div className="form-group">
              <label className="form-label">
                모집 마감일 <span className="required">*</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="create-btn-row">
            <button
              type="submit"
              className="btn btn-medium btn-main btn-hover-float"
              disabled={isDisabled}
            >
              등록하기
            </button>
            <button
              type="button"
              className="btn btn-medium btn-soft"
              onClick={() => navigate("/crews")}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CrewCreatePage;
