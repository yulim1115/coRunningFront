import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CrewCreatePage";
import "./CrewPage.css";
import RegionSelector from "../../components/common/RegionSelector.jsx";
import { FaUserPlus } from "react-icons/fa";


function CrewListPage() {
  const navigate = useNavigate();
  const [region, setRegion] = useState({sido: "", gu: ""});

  return (
    <div>
      <div className="registration-notice">
        <p>함께 달릴 크루를 모집하고 싶으신가요?</p>
        <button onClick={() => navigate("/CrewCreatePage")}>
            <FaUserPlus /> 크루 모집 등록
        </button>

        <div className="filter-controls-area">
          <div className="filter-group">
            <label>지역</label>
            <RegionSelector onChange={(selected)=>{
                setRegion(selected);
            }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrewListPage;
