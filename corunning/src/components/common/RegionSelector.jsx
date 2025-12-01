import React, { useState } from "react";
import { sidoList } from "sigungu";
import { FiChevronDown } from "react-icons/fi";   // 셀렉트 화살표

export default function RegionSelector({ onChange }) {
  const [sidoCode, setSidoCode] = useState("");
  const [guList, setGuList] = useState([]);
  const [guCode, setGuCode] = useState("");

  // 시도 선택
  const handleSidoChange = (e) => {
    const code = e.target.value;
    setSidoCode(code);

    const sidoObj = sidoList.find((s) => s.code === code);
    const list = sidoObj ? sidoObj.subClassList : [];
    setGuList(list);
    setGuCode("");

    if (onChange) {
      onChange({ sido: sidoObj.name, gu: "" });
    }
  };

  // 구 선택
  const handleGuChange = (e) => {
    const code = e.target.value;
    setGuCode(code);

    const guObj = guList.find((g) => g.code === code);

    if (onChange) {
      onChange({
        sido: sidoList.find((s) => s.code === sidoCode)?.name || "",
        gu: guObj?.name || "",
      });
    }
  };

  return (
    <div className="region-selector" style={{ display: "flex", gap: "10px" }}>

      {/* 시/도 */}
      <div className="select-wrap">
        <select value={sidoCode} onChange={handleSidoChange}>
          <option value="" hidden>시/도 선택</option>
          {sidoList.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
        <FiChevronDown className="select-arrow" />
      </div>

      {/* 구 */}
      <div className="select-wrap">
        <select
          value={guCode}
          onChange={handleGuChange}
          disabled={!sidoCode}
        >
          <option value="" hidden>시/군/구 선택</option>
          {guList.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
        <FiChevronDown className="select-arrow" />
      </div>

    </div>
  );
}
