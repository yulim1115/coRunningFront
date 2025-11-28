import React, { useState, useEffect } from "react";
import axios from "axios";
import LogCard from "../../components/cards/LogCard";
import "./RunLogPage.css";
import { distance } from "@turf/turf";

import {
  getSavedCourses,
  getRecords,
  finishCourse,
  createRecord,
  updateRecord,
  deleteRecord
} from "../../api/logApi";

export default function RunLogPage() {
  const [savedCourses, setSavedCourses] = useState([]);
  const [records, setRecords] = useState([]);

  const [openSavedId, setOpenSavedId] = useState(null); // 어느 저장 코스의 입력폼이 열려있는지
  const [showNewRecordForm, setShowNewRecordForm] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);

  // 저장한 코스별 입력값 (완주 날짜 / 시간)
  const [inputValues, setInputValues] = useState({});
  // 새 자율 기록 입력 값
  const [newRecord, setNewRecord] = useState({
    title: "",
    distance: "",
    date: "",
    time: ""
  });
  // 기록 수정 입력 값
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    loadSavedCourses();
    loadRecords();
  }, []);

  const loadSavedCourses = async () => {
    try {
      const data = await getSavedCourses();
      // 백엔드 응답 형식 가정: { routeId, route, location, distance, level }
      setSavedCourses(
        data.map((d) => ({
          id: d.routeId,
          title: d.route,
          location: d.location,
          distance: d.distance, // 숫자(km)라고 가정
          level: d.level ?? "기본"
        }))
      );
    } catch (err) {
      console.error("저장한 코스 불러오기 실패:", err);
      alert("저장한 코스를 불러오는 중 오류가 발생했습니다.");
    }
  };

  const loadRecords = async () => {
    try {
      const data = await getRecords();
      // 백엔드 응답 형식 가정: { recordId, courseName, location, distance, runDate, runTime }
      setRecords(
        data.map((r) => ({
          id: r.recordId,
          title: r.courseName,
          location: r.location,
          distance: r.distance, // 숫자(km)
          rawDate: r.runDate, // "2025-11-28"
          date: r.runDate ? r.runDate.replace(/-/g, ".") : "",
          time: r.runTime
        }))
      );
    } catch (err) {
      console.error("완주 기록 불러오기 실패:", err);
      alert("완주 기록을 불러오는 중 오류가 발생했습니다.");
    }
  };

  // 저장한 코스 입력값 업데이트
  const updateInput = (courseId, field, value) => {
    setInputValues((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [field]: value
      }
    }));
  };

  // 기록 수정 입력값 업데이트
  const updateEditInput = (recordId, field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [recordId]: {
        ...prev[recordId],
        [field]: value
      }
    }));
  };

  // ✅ 저장한 코스에서 "완주 완료 버튼" 눌렀을 때
  const submitFinish = async (course) => {
    const values = inputValues[course.id] || {};
    const { date, time } = values;

    if (!date || !time) {
      alert("완주 날짜와 시간을 모두 입력해주세요!");
      return;
    }

    try {
      await finishCourse({
        routeId: course.id, // 백엔드에서 routeId로 받는다고 가정
        runDate: date,
        runTime: time
      });

      await loadRecords(); // 아래 기록 갱신

      // 입력값 초기화 + 폼 닫기
      setInputValues((prev) => ({
        ...prev,
        [course.id]: { date: "", time: "" }
      }));
      setOpenSavedId(null);
    } catch (err) {
      console.error("완주 기록 저장 실패:", err);
      alert("완주 기록 저장 중 오류가 발생했습니다.");
    }
  };

  // ✅ 새 자율 완주 기록 추가
  const submitNewRecord = async () => {
    if (!newRecord.title || !newRecord.date || !newRecord.time) {
      alert("코스 이름, 날짜, 시간을 입력해주세요!");
      return;
    }

    try {
      await createRecord({
        courseName: newRecord.title,
        distance: newRecord.distance ? Number(newRecord.distance) : null,
        runDate: newRecord.date,
        runTime: newRecord.time
      });

      await loadRecords();
      setNewRecord({
        title: "",
        distance: "",
        date: "",
        time: ""
      });
      setShowNewRecordForm(false);
    } catch (err) {
      console.error("자율 기록 저장 실패:", err);
      alert("자율 기록 저장 중 오류가 발생했습니다.");
    }
  };

  // ✅ 기록 수정 완료
  const submitEditRecord = async (record) => {
    const values = editValues[record.id] || {};
    const date = values.date ?? record.rawDate;
    const time = values.time ?? record.time;

    if (!date || !time) {
      alert("날짜와 시간을 입력해주세요!");
      return;
    }

    try {
      await updateRecord(record.id, {
        runDate: date,
        runTime: time
      });

      await loadRecords();
      setEditingRecordId(null);
    } catch (err) {
      console.error("기록 수정 실패:", err);
      alert("기록 수정 중 오류가 발생했습니다.");
    }
  };

  // ✅ 기록 삭제
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteRecord(recordId);
      await loadRecords();
    } catch (err) {
      console.error("기록 삭제 실패:", err);
      alert("기록 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="runlog-wrapper">
      <h2 className="runlog-title">Run Log</h2>

      {/* 🔵 저장한 코스 영역 */}
      <div className="section-box">
        <div className="section-header">
          <h3>
            저장한 코스 <span>(총 {savedCourses.length}개)</span>
          </h3>
        </div>

        {savedCourses.map((course) => (
          <div key={course.id}>
            <LogCard
              type="saved"
              item={{
                title: course.title,
                location: course.location,
                distance: course.distance,
                level: course.level
              }}
              isOpen={openSavedId === course.id}
              onMainButton={() =>
                setOpenSavedId(openSavedId === course.id ? null : course.id)
              }
              onDelete={() => console.log("저장 코스 삭제 예정:", course.id)}
            />

            {openSavedId === course.id && (
              <div className="input-form">
                <p className="form-title">완주 기록 입력: {course.title}</p>

                <div className="two-grid">
                  <div className="form-row">
                    <label>완주 날짜</label>
                    <input
                      type="date"
                      value={inputValues[course.id]?.date || ""}
                      onChange={(e) =>
                        updateInput(course.id, "date", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-row">
                    <label>완주 시간</label>
                    <input
                      type="text"
                      placeholder="예: 01:30:05"
                      value={inputValues[course.id]?.time || ""}
                      onChange={(e) =>
                        updateInput(course.id, "time", e.target.value)
                      }
                    />
                  </div>
                </div>

                <button
                  className="btn-submit"
                  onClick={() => submitFinish(course)}
                >
                  완주 완료
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 🟢 코스 완주 기록 영역 */}
      <div className="section-box">
        <div className="section-header">
          <h3>
            코스 완주 기록 <span>(총 {records.length}개)</span>
          </h3>

          <button
            className="btn-add"
            onClick={() => setShowNewRecordForm(!showNewRecordForm)}
          >
            {showNewRecordForm ? "닫기" : "+ 새 완주 기록 추가"}
          </button>
        </div>

        {/* 새 자율 기록 폼 */}
        {showNewRecordForm && (
          <div className="input-form-large">
            <p className="form-title">자율 완주 기록 (코스명 직접 입력)</p>

            <div className="two-cols">
              <div className="form-row">
                <label>코스 이름 (필수)</label>
                <input
                  type="text"
                  placeholder="예: 우리 동네 한 바퀴"
                  value={newRecord.title}
                  onChange={(e) =>
                    setNewRecord((prev) => ({
                      ...prev,
                      title: e.target.value
                    }))
                  }
                />
              </div>

              <div className="form-row">
                <label>러닝 거리 (KM)</label>
                <input
                  type="number"
                  placeholder="예: 5.5"
                  value={newRecord.distance}
                  onChange={(e) =>
                    setNewRecord((prev) => ({
                      ...prev,
                      distance: e.target.value
                    }))
                  }
                />
              </div>
            </div>

            <div className="two-grid">
              <div className="form-row">
                <label>완주 날짜</label>
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) =>
                    setNewRecord((prev) => ({
                      ...prev,
                      date: e.target.value
                    }))
                  }
                />
              </div>

              <div className="form-row">
                <label>완주 시간</label>
                <input
                  type="text"
                  placeholder="01:30:05"
                  value={newRecord.time}
                  onChange={(e) =>
                    setNewRecord((prev) => ({
                      ...prev,
                      time: e.target.value
                    }))
                  }
                />
              </div>
            </div>

            <button className="btn-submit" onClick={submitNewRecord}>
              기록 저장
            </button>
          </div>
        )}

        {/* 기존 완주 기록 목록 */}
        {records.map((record) => (
          <div key={record.id}>
            <LogCard
              type="record"
              item={{
                title: record.title,
                location: record.location,
                distance: record.distance,
                date: record.date,
                time: record.time
              }}
              isOpen={editingRecordId === record.id}
              onMainButton={() =>
                setEditingRecordId(
                  editingRecordId === record.id ? null : record.id
                )
              }
              onDelete={() => handleDeleteRecord(record.id)}
            />

            {editingRecordId === record.id && (
              <div className="edit-form">
                <p className="form-title">기록 수정: {record.title}</p>

                <div className="two-grid">
                  <div className="form-row">
                    <label>완주 날짜</label>
                    <input
                      type="date"
                      defaultValue={record.rawDate}
                      value={
                        editValues[record.id]?.date || record.rawDate || ""
                      }
                      onChange={(e) =>
                        updateEditInput(record.id, "date", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-row">
                    <label>완주 시간</label>
                    <input
                      type="text"
                      defaultValue={record.time}
                      value={editValues[record.id]?.time || record.time || ""}
                      onChange={(e) =>
                        updateEditInput(record.id, "time", e.target.value)
                      }
                    />
                  </div>
                </div>

                <button
                  className="btn-submit"
                  onClick={() => submitEditRecord(record)}
                >
                  수정 완료
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}