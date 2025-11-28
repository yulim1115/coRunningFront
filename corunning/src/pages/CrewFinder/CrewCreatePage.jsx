import "./CrewPage.css";
import React, { useState } from "react";
import RegionSelector from "../../components/common/RegionSelector";

function CrewCreatePage() {
      //기본 입력값 
      const [title, setTitle] = useState("");                     // 제목
      const [content, setContent] = useState("");                 // 내용
      const [routePathJson, setRoutePathJson] = useState("");     //코스 데이터
      const [region, setRegion] = useState({ sido: "", gu: "" }); //지역
      


  return (
    <div>
        <div className="registration-wrapper">
            <h2 className="registration-title">크루 모집 등록</h2>
        </div>

        <form action="#" method="post">
            <div className="form-group">
                <label htmlFor="title">모집 글 제목<span>*</span></label>
                <input type="text" id="title" name="title" placeholder="예 : 서울 야경 명소 크루, '@@@' 모집"/>
            </div>

            <div className="form-group">
                <label htmlFor="content">모집 글 내용<span>*</span></label>
                <textarea id="content" name="content" rows="10" required></textarea>
            </div>

            <div className="form-group route-data-input">
                <label htmlFor="route-data">추천 코스 데이터 업로드</label>
                <textarea id="route-data" placeholder="선택사항"></textarea>
            </div>

            <div class="meta-fields">
                    <div class="form-group">
                        <label for="region">지역 <span>*</span></label>
                        <div class="custom-select">
                            <RegionSelector onChange={(selected) => {
                                setRegion(selected);}} />
                        </div>
                    </div>

                    
                    <div class="form-group">
                        <label for="type">타입 <span>*</span></label>
                        <select id="type" required>
                            <option value="">타입 선택</option>
                            <option value="drawing">드로잉런</option>
                            <option value="regular">레귤러런</option>
                        </select>
                    </div>
            </div>
                
            <div class="meta-fields">
                    <div class="form-group">
                        <label for="max_members">모집 인원 (명) <span>*</span></label>
                        <input type="number" id="max_members" placeholder="예: 10" required min="1"/>
                    </div>

                    <div class="form-group">
                        <label for="recruitment_period">모집 마감일 <span>*</span></label>
                        <input type="date" id="recruitment_period" required/>
                    </div>
     
            </div>
            <div className="action-buttons">
                        <button type="submit" className="register-btn">등록</button>
                        <button type="button" className="cancel-btn">취소</button>              
            </div> 




            
        </form>
    </div>
  );
}
export default CrewCreatePage;
