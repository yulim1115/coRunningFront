/* CrewModifyPage.jsx */
import { useState, useEffect } from "react";
import "./CrewCreatePage.css";
import RegionSelector from "../../components/common/RegionSelector";
import { getCrewDetailAPI, updateCrewAPI } from "../../api/crewApi";
import { FiChevronDown } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";

function CrewModifyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [routePath, setRoutePath] = useState("");
  const [region, setRegion] = useState({ sido: "", gu: "" });
  const [boardType, setBoardType] = useState("");
  const [recruitCount, setRecruitCount] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
      const fetchCrews = async () => {
        try {
          const data = await getCrewDetailAPI(id); 
          console.log("내 크루 정보:", data);
          setTitle(data.title?? "");
          setContent(data.content?? "");
          setRoutePath(data.routePath);
          const [sido, gu] = (data.region?? "").split(" ");
          setRegion({ sido, gu });
          setBoardType(data.boardType);
          setRecruitCount(data.recruitCount);
          setDeadline(data.deadline);
        } catch (error) {
          console.error("크루 정보 불러오기 실패:", error);
        }  
      };
      fetchCrews();
  
    }, [id]);

    const isDisabled =
    !title.trim() ||
    !content.trim() ||
    !region.sido ||
    !boardType ||
    !recruitCount ||
    !deadline;

    //수정
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
          await updateCrewAPI(id, data);
          alert("크루 모집 글이 수정되었습니다!");
          navigate("/mypage");
        } catch {
          alert("수정 실패. 다시 시도해주세요.");
        }
      };

  return (
    <main className="route-create-container">
      <div className="create-wrapper">
        <h1 className="create-title">크루 모집글 수정</h1>

        <form onSubmit={handleSubmit} className="create-form">
          {/* 제목 */}
          <div className="form-group">
            <label className="form-label">
              모집 글 제목 <span className="required">*</span>
            </label>
            <input
              type="text"
              className="input-field"
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
              className="textarea-field"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* 추천 코스 JSON */}
          <div className="form-group">
            <label className="form-label">추천 코스 데이터 업로드 (선택)</label>
            <textarea
              className="textarea-field"
              value={routePath}
              onChange={(e) => setRoutePath(e.target.value)}
            />
          </div>

          {/* 지역 1줄 */}
          <div className="meta-fields single">
            <div className="form-group full">
              <label className="form-label">
                지역 <span className="required">*</span>
              </label>
              <RegionSelector value={region} onChange={(v) => setRegion(v)} />
            </div>
          </div>

          {/* 타입 / 인원 / 마감일 */}
          <div className="meta-fields triple">
            {/* 타입 */}
            <div className="form-group">
              <label className="form-label">
                타입 <span className="required">*</span>
              </label>
              <div className="select-wrap">
                <select
                  value={boardType}
                  onChange={(e) => setBoardType(e.target.value)}
                >
                  <option value="">선택</option>
                  <option value="NORMAL">크루 모집</option>
                  <option value="DRAWING">드로잉런</option>
                  <option value="FLASH">번개런</option>
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
                className="input-field"
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
                className="input-field"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="create-btn-row">
            <button
              type="submit"
              className="btn-medium main"
              disabled={isDisabled}
            >
              수정
            </button>
            <button
              type="button"
              className="btn-medium"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CrewModifyPage;
