// src/pages/RunRoutes/RunLogPage.jsx
import React, { useState, useEffect } from "react";
import LogCard from "../../components/cards/LogCard";
import "./RunLogPage.css";

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

  const [openSavedId, setOpenSavedId] = useState(null);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [showNewRecordForm, setShowNewRecordForm] = useState(false);

  const [inputValues, setInputValues] = useState({});
  const [editValues, setEditValues] = useState({});

  const [newRecord, setNewRecord] = useState({
    title: "",
    distance: "",
    date: "",
    time: ""
  });

  // 로딩
  useEffect(() => {
    loadSavedCourses();
    loadRecords();
  }, []);

  // ───────────────────────────────────────────
  // 저장한 코스 불러오기
  const loadSavedCourses = async () => {
    try {
      const data = await getSavedCourses();
      setSavedCourses(
        data.map((d) => ({
          id: d.routeId,
          title: d.route,
          location: d.location,
          distance: d.distance,
          level: d.level ?? "기본"
        }))
      );
    } catch (err) {
      // fallback
      setSavedCourses([
        {
          id: 1,
          title: "남산 순환 도로",
          location: "서울 용산구",
          distance: 7.2,
          level: "고급"
        },
        {
          id: 2,
          title: "광안리 해변 힐링 런",
          location: "부산 수영구",
          distance: 5.0,
          level: "초급"
        }
      ]);
    }
  };

  // ───────────────────────────────────────────
  // 완주 기록 불러오기
  const loadRecords = async () => {
    try {
      const data = await getRecords();
      setRecords(
        data.map((r) => ({
          id: r.recordId,
          title: r.courseName,
          distance: r.distance,
          location: r.location,
          rawDate: r.runDate,
          date: r.runDate.replace(/-/g, "."),
          time: r.runTime
        }))
      );
    } catch (err) {
      // fallback
      setRecords([
        {
          id: 11,
          title: "청계천 따라 달리기",
          location: "서울 종로구",
          distance: 6.5,
          rawDate: "2025-11-20",
          date: "2025.11.20",
          time: "00:45:30"
        },
        {
          id: 12,
          title: "한강공원 10K",
          location: "지역 미정",
          distance: 10,
          rawDate: "2025-11-15",
          date: "2025.11.15",
          time: "01:05:12"
        }
      ]);
    }
  };

  // ───────────────────────────────────────────
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

  // ───────────────────────────────────────────
  // 저장한 코스 → 아래 기록으로 추가
  const submitFinish = async (course) => {
    const { date, time } = inputValues[course.id] || {};

    if (!date || !time) return alert("날짜와 시간을 모두 입력하세요!");

    try {
      await finishCourse({
        routeId: course.id,
        runDate: date,
        runTime: time
      });
      await loadRecords();
    } catch (err) {
      // fallback
      setRecords((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: course.title,
          location: course.location,
          distance: course.distance,
          rawDate: date,
          date: date.replace(/-/g, "."),
          time
        }
      ]);
    }

    // 초기화
    setInputValues((prev) => ({ ...prev, [course.id]: {} }));
    setOpenSavedId(null);
  };

  // ───────────────────────────────────────────
  // 새 자율 기록 추가
  const submitNewRecord = async () => {
    const { title, distance, date, time } = newRecord;

    if (!title || !date || !time) return alert("필수값을 입력하세요!");

    try {
      await createRecord({
        courseName: title,
        distance: Number(distance) || null,
        runDate: date,
        runTime: time
      });
      await loadRecords();
    } catch (err) {
      setRecords((prev) => [
        ...prev,
        {
          id: Date.now(),
          title,
          distance,
          rawDate: date,
          date: date.replace(/-/g, "."),
          time
        }
      ]);
    }

    setNewRecord({ title: "", distance: "", date: "", time: "" });
    setShowNewRecordForm(false);
  };

  // ───────────────────────────────────────────
  // 기록 수정
  const updateEditInput = (id, field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const submitEditRecord = async (record) => {
    const date = editValues[record.id]?.date || record.rawDate;
    const time = editValues[record.id]?.time || record.time;

    try {
      await updateRecord(record.id, { runDate: date, runTime: time });
      await loadRecords();
    } catch {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === record.id
            ? { ...r, rawDate: date, date: date.replace(/-/g, "."), time }
            : r
        )
      );
    }

    setEditingRecordId(null);
  };

  // ───────────────────────────────────────────
  // 기록 삭제
  const deleteRec = async (id) => {
    if (!window.confirm("정말 삭제할까요?")) return;

    try {
      await deleteRecord(id);
      await loadRecords();
    } catch {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // ───────────────────────────────────────────
  // 컴포넌트 구조
  return (
    <div className="runlog-wrapper">

      <h2 className="runlog-title">Run Log</h2>

      {/* ---------------- 저장한 코스 ---------------- */}
      <div className="section-box">
        <div className="section-header">
          <h3>저장한 코스 <span>(총 {savedCourses.length}개)</span></h3>
        </div>

        {savedCourses.map((course) => (
          <div key={course.id}>
            <LogCard
              type="saved"
              item={course}
              isOpen={openSavedId === course.id}
              onMainButton={() =>
                setOpenSavedId(openSavedId === course.id ? null : course.id)
              }
            />

            {/* ▼ 여기서 기록 입력 폼을 표시한다 (세 번째 이미지 스타일) */}
            {openSavedId === course.id && (
              <div className="input-form-large">
                <p className="form-title">코스 완주 기록 입력</p>

                <div className="two-cols">
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
                      placeholder="00:45:30"
                      value={inputValues[course.id]?.time || ""}
                      onChange={(e) =>
                        updateInput(course.id, "time", e.target.value)
                      }
                    />
                  </div>
                </div>

                <button className="btn-submit" onClick={() => submitFinish(course)}>
                  기록 저장
                </button>
              </div>
            )}
          </div>
        ))}

        {savedCourses.length === 0 && (
          <p className="empty">저장한 코스가 없습니다.</p>
        )}
      </div>

      {/* ---------------- 완주 기록 ---------------- */}
      <div className="section-box">
        <div className="section-header">
          <h3>코스 완주 기록 <span>(총 {records.length}개)</span></h3>

          <button className="btn-add" onClick={() => setShowNewRecordForm(!showNewRecordForm)}>
            + 새 완주 기록 추가
          </button>
        </div>

        {/* ▼ 세 번째 사진의 입력칸 그대로 */}
        {showNewRecordForm && (
          <div className="input-form-large">
            <p className="form-title">자율 완주 기록 추가</p>

            <div className="two-cols">
              <div className="form-row">
                <label>코스 이름</label>
                <input
                  value={newRecord.title}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, title: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>거리(KM)</label>
                <input
                  type="number"
                  value={newRecord.distance}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, distance: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="two-cols">
              <div className="form-row">
                <label>완주 날짜</label>
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, date: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>완주 시간</label>
                <input
                  type="text"
                  value={newRecord.time}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, time: e.target.value })
                  }
                />
              </div>
            </div>

            <button className="btn-submit" onClick={submitNewRecord}>
              기록 저장
            </button>
          </div>
        )}

        {/* ▼ 완료 기록 리스트 */}
        {records.map((record) => (
          <div key={record.id}>
            <LogCard
              type="record"
              item={record}
              isOpen={editingRecordId === record.id}
              onMainButton={() =>
                setEditingRecordId(editingRecordId === record.id ? null : record.id)
              }
              onDelete={() => deleteRec(record.id)}
            />

            {editingRecordId === record.id && (
              <div className="input-form-large">
                <p className="form-title">기록 수정</p>

                <div className="two-cols">
                  <div className="form-row">
                    <label>완주 날짜</label>
                    <input
                      type="date"
                      defaultValue={record.rawDate}
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
                      onChange={(e) =>
                        updateEditInput(record.id, "time", e.target.value)
                      }
                    />
                  </div>
                </div>

                <button className="btn-submit" onClick={() => submitEditRecord(record)}>
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
