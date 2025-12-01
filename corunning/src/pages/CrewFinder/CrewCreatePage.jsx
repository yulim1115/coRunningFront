import "./CrewPage.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CrewListPage.jsx";
import RegionSelector from "../../components/common/RegionSelector";
import { crewCreateAPI } from "../../api/crewApi.js";

function CrewCreatePage() {
    const Navigate = useNavigate();

      //기본 입력값 
      const [title, setTitle] = useState("");                     // 제목
      const [content, setContent] = useState("");                 // 내용
      const [routePath, setRoutePath] = useState("");     //코스 데이터
      const [region, setRegion] = useState({ sido: "", gu: "" }); //지역
      const [boardType, setBoardType] = useState("");               //타입
      const [recruitCount, setRecruitCount] = useState(1);         //모집 인원
      const [deadline, setDeadline] = useState("");                //모집 마감일

      //null값 체크

      // 에러 메시지
      const [errorMsg, setErrorMsg] = useState("");

      //게시물 생성 요청하기
      const handleSubmit = async (e) => { 
        e.preventDefault();
          console.log("폼 제출 됨!");

        const data = {
        title: title,
        content: content,
        routePathJson: routePath,
        region: `${region.sido} ${region.gu}`,
        boardType: boardType,
        recruitCount: recruitCount,
        deadline: deadline,
      } 
      try {
        await crewCreateAPI(data);
        alert("크루 모집 글이 성공적으로 등록되었습니다!");
        Navigate("/Crews")
        
      } catch (error) {
        setErrorMsg(
          error.response?.data?.message ||
            "크루 모집 글 등록에 실패했습니다. 다시 시도해주세요."
        );}
      }
      

  return (
    <div>
        <div className="registration-wrapper">
            <h2 className="registration-title">크루 모집 등록</h2>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="title">모집 글 제목<span>*</span></label>
                <input type="text" id="title" name="title"  value={title}
                onChange={(e) => setTitle(e.target.value)} placeholder="예 : 서울 야경 명소 크루, '@@@' 모집" required/>
            </div>

            <div className="form-group">
                <label htmlFor="content">모집 글 내용<span>*</span></label>
                <textarea id="content" name="content" value={content}
                onChange={(e) => setContent(e.target.value)}></textarea>
            </div>

            <div className="form-group route-data-input">
                <label htmlFor="route-data">추천 코스 데이터 업로드</label>
                <textarea id="route-data" value={routePath} 
                onChange={(e) => setRoutePath(e.target.value)}placeholder="선택사항"></textarea>
            </div>

            <div className="meta-fields">
                    <div className="form-group">
                        <label htmlFor="region">지역 <span>*</span></label>
                        <div className="custom-select">
                            <RegionSelector onChange={(selected) => {
                                setRegion(selected);}} />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="type">타입 <span>*</span></label>
                        <select id="type" value={boardType} required onChange={(e) => setBoardType(e.target.value)}>
                            <option value="NORMAL">크루 모집</option>
                            <option value="DRAWING">드로잉런</option>
                            <option value="FLASH">번개런</option>
                        </select>
                    </div>
            </div>
                
            <div className="meta-fields">
                    <div className="form-group">
                        <label htmlFor="max_members">모집 인원 (명) <span>*</span></label>
                        <input type="number" id="max_members" value={recruitCount} 
                        onChange={(e) => setRecruitCount(e.target.value)} placeholder="예: 10" required min="1"/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="recruitment_period">모집 마감일 <span>*</span></label>
                        <input type="date" id="recruitment_period" 
                        onChange={(e) => setDeadline(e.target.value)} required/>
                    </div>

     
            </div>
            <div className="action-buttons">
                        <button type="submit" className="register-btn">등록</button>
                        <button type="button" className="cancel-btn" onClick={ () => Navigate("/Crews")}>취소</button>              
            </div> 
        </form>
    </div>
  );
}
export default CrewCreatePage;
