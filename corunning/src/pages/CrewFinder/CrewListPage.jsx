import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CrewCreatePage";
import "./CrewPage.css";
import RegionSelector from "../../components/common/RegionSelector";
import { FaUserPlus } from "react-icons/fa";


function CrewListPage() {
  const navigate = useNavigate();
  const [region, setRegion] = useState({ sido: "", gu: "" });

  return (
    <div>
      <section className="page-header-area">
        <h1>Crew Finder</h1>
      </section>
      <div className="registration-notice">
        <p>함께 달릴 크루를 모집하고 싶으신가요?</p>
        <button className="register-crew-btn" onClick={() => navigate("/CrewCreatePage")}>
          <FaUserPlus />&nbsp;크루 모집 등록
        </button>
      </div>

        <section class="filter-controls-area">
            <div class="filter-group-wrapper">
                <div class="filter-group">
                    <label for="filter-region">지역</label>
                    <div class="custom-select">
                      <RegionSelector onChange={(selected) => {
                      setRegion(selected);
                      }} />
                    </div>
                </div>
            </div>
            <div class="filter-group">
                    <label for="filter-difficulty">난이도</label>
                    <div class="custom-select">
                        <select id="filter-difficulty">
                            <option>전체</option>
                            <option>초급</option>
                            <option>중급</option>
                            <option>고급</option>
                        </select>
                    </div>
                </div>

                <div class="filter-group">
                    <label for="filter-type">종류</label>
                    <div class="custom-select">
                        <select id="filter-type">
                            <option>전체</option>
                            <option>레귤러런</option>
                            <option>드로잉런</option>
                        </select>
                    </div>
                </div>

                <div class="filter-group">
                    <label for="filter-status">상태</label>
                    <div class="custom-select">
                        <select id="filter-status">
                            <option>전체</option>
                            <option>모집 중</option>
                            <option>모집 마감</option>
                        </select>
                    </div>
                </div>
                
                <button class="search-button">
                   조회
                </button>
        </section>
      </div>
  );
}

export default CrewListPage;
