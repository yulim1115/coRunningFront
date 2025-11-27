import React, { useState } from "react";
import { sidoList, getSub } from "sigungu";

export default function RegionSelector({ onChange }) {
  const [sidoCode, setSidoCode] = useState("");   // 코드 저장
  const [guList, setGuList] = useState([]);
  const [guName, setGuName] = useState("");       // 구 이름

  const handleSidoChange = (e) => {
    const code = e.target.value;            // 시/도 코드
    setSidoCode(code);

    const sidoObj = sidoList.find((s) => s.code === code);
    console.log("선택한 시/도 코드:", code);
    console.log("선택한 시/도 객체:", sidoObj);

    setGuList(sidoObj.subClassList);
  };

  const handleGuChange = (e) => {
    const code = e.target.value;
    const guObj = guList.find((g) => g.code === code);

    setGuName(guObj ? guObj.name : "");
  };

  return (
    <div className="region-selector">
      <select value={sidoCode} onChange={handleSidoChange} >
        <option disabled hidden value="">시/도 선택</option>
        {sidoList.map((item) => (
          <option key={item.code} value={item.code}>
            {item.name}
          </option>
        ))}
      </select>

      {/* 시/군/구 선택 */}
      <select
        value={guList.find((g) => g.name === guName)?.code || ""}
        onChange={handleGuChange}
        disabled={!sidoCode}
        style={{ marginLeft: 8 }}
      >
        <option disabled hidden value="">시/군/구 선택</option>
        {guList.map((item) => (
          <option key={item.code} value={item.code}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}
