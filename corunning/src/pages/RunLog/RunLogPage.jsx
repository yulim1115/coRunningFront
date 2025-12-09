// src/pages/RunLog/RunLogPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LogCard from "../../components/cards/LogCard";
import "./RunLogPage.css";

import {
  getDipList,
  getRouteById,
  removeDip,
  updateDip,
} from "../../api/routesApi";
export const formatToTime = (value) => {
  // 숫자만 남기기
  const numeric = value.replace(/\D/g, "").slice(0, 6);

  // 자리수에 따라 포맷팅
  const padded = numeric.padStart(6, "0");
  const hh = padded.slice(0, 2);
  const mm = padded.slice(2, 4);
  const ss = padded.slice(4, 6);

  return `${hh}:${mm}:${ss}`;
};
export const isValidTime = (t) => {
  if (!/^\d{2}:\d{2}:\d{2}$/.test(t)) return false;

  const [hh, mm, ss] = t.split(":").map(Number);

  return (
    hh >= 0 &&
    mm >= 0 && mm < 60 &&
    ss >= 0 && ss < 60
  );
};
// 현재 사용자 ID 가져오기
const getCurrentUserId = () => {
  return sessionStorage.getItem("userEmail");
};

export default function RunLogPage() {
  const navigate = useNavigate();
  const userId = getCurrentUserId();

  const [savedCourses, setSavedCourses] = useState([]); // 저장된 코스
  const [records, setRecords] = useState([]); // 완주 기록

  const [loading, setLoading] = useState(true);

  const [openSavedIds, setOpenSavedIds] = useState({});
  const [editingRecordIds, setEditingRecordIds] = useState({});
  const [timeValue, setTimeValue] = useState("");
  const [editTimeValue, setEditTimeValue] = useState("");
  const [inputValues, setInputValues] = useState({});
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    document.body.style.backgroundColor = "var(--color-bg-light)";
    return () => {
      document.body.style.backgroundColor = "var(--color-bg)";
    };
  }, []);

  // 데이터 로딩
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const dips = await getDipList(userId);

      const fullList = await Promise.all(
      dips.map(async (dip) => {
        let route = null;

        // ⭐ routeId가 있는 경우에만 API 호출
        if (dip.routeId) {
          try {
            route = await getRouteById(dip.routeId);
          } catch (e) {
            console.warn("route 조회 실패:", dip.routeId, e);
          }
        }

        return {
          dipId: dip.dipId,
          routeId: dip.routeId,   // null 일 수 있음
          title: route?.title || dip.title || "커스텀 코스",
          location: route?.location || dip.location || "자율기록",
          distance:
            typeof route?.distance === "number"
              ? route.distance
              : dip.distance || 0,
          level: route?.difficulty || dip.difficulty || "자율기록",
          complete: dip.complete === true,
          record: dip.record || ""
        };
      })
    );

      setSavedCourses(fullList.filter((c) => !c.complete));
      setRecords(
        fullList
          .filter((c) => c.complete && c.record)
          .map((c) => {
            const [yymmdd, hhmmss] = c.record.split(" ");
            return {
              id: c.dipId,
              dipId: c.dipId,
              routeId: c.routeId,
              title: c.title,
              location: c.location,
              distance: c.distance,
              level: c.level,
              rawDate: yymmdd,
              date: yymmdd?.replace(/-/g, ".") || "",
              time: hhmmss || "",
            };
          })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      alert("로그인 후 이용해주세요.");
      navigate("/login");
      return;
    }
    loadData();
  }, [userId, navigate, loadData]);

  // 저장한 코스 입력값 업데이트
  const updateInput = (dipId, field, value) => {
    setInputValues((prev) => ({
      ...prev,
      [dipId]: { ...prev[dipId], [field]: value },
    }));
  };

  // 완주 기록 저장
  const submitFinish = async (course) => {
    const { date, time } = inputValues[course.dipId] || {};
    if (!date || !time) return alert("날짜와 시간을 입력해주세요.");
    if (!isValidTime(time)) {
      return alert("시간은 HH:MM:SS 형식이며 MM/SS는 0~59여야 합니다.");
    }
    const record = `${date} ${time}`;

    try {
      await updateDip(course.dipId, true, record);

      setSavedCourses((prev) => prev.filter((c) => c.dipId !== course.dipId));

      const newRecord = {
        id: course.dipId,
        dipId: course.dipId,
        routeId: course.routeId,
        title: course.title,
        location: course.location,
        distance: course.distance,
        level: course.level,
        rawDate: date,
        date: date.replace(/-/g, "."),
        time,
      };

      setRecords((prev) => [...prev, newRecord]);

      alert("기록이 저장되었습니다!");
      setTimeValue("");
      setOpenSavedIds((prev) => ({ ...prev, [course.dipId]: false }));
    } catch (err) {
      alert("저장 실패: " + err.message);
    }
  };

  // 기록 수정 입력값 업데이트
  const updateEditInput = (id, field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // 기록 수정 저장
  const submitEditRecord = async (record) => {
    const date = editValues[record.id]?.date || record.rawDate;
    const time = editValues[record.id]?.time || record.time;
    const newRecordStr = `${date} ${time}`;

    try {
      await updateDip(record.id, true, newRecordStr);

      setRecords((prev) =>
        prev.map((r) =>
          r.id === record.id
            ? {
                ...r,
                rawDate: date,
                date: date.replace(/-/g, "."),
                time,
              }
            : r
        )
      );

      alert("기록이 수정되었습니다!");
      setEditTimeValue("");
      setEditingRecordIds((prev) => ({ ...prev, [record.id]: false }));
    } catch (err) {
      alert("수정 실패: " + err.message);
    }
  };

  // 기록 삭제 후 저장한 코스로 되돌리기
  const deleteRec = async (record) => {
    if (!window.confirm("기록을 삭제하시겠습니까?")) return;

    try {
      await updateDip(record.dipId, false, "00:00:00");

      setRecords((prev) => prev.filter((r) => r.id !== record.id));

      const restoredItem = {
        dipId: record.dipId,
        routeId: record.routeId,
        title: record.title,
        location: record.location,
        distance: record.distance,
        level: record.level,
        complete: false,
        record: " ",
      };

      setSavedCourses((prev) => [...prev, restoredItem]);

      alert("삭제 완료!");
    } catch (err) {
      alert("삭제 실패: " + err.message);
    }
  };

  // 찜 삭제
  const handleRemoveDip = async (course) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await removeDip(course.dipId); // dipId로 바로 삭제!
      setSavedCourses(prev => prev.filter(c => c.dipId !== course.dipId));
    } catch (err) {
      alert("실패: " + err.message);
    }
  };
  

  // 로딩 화면
  if (loading) {
    return (
      <div className="runlog-wrapper">
        <h2 className="runlog-title">Run Log</h2>

        <div className="section-box">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </div>

        <div className="section-box">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="runlog-container">
      <div className="runlog-wrapper">
        {/* 상단 제목 */}
        <section className="runlog-title-section">
          <h1 className="runlog-title">Run Log</h1>
        </section>

        {/* 저장한 코스 */}
        <section className="section-box">
          <header className="title-section">
            <h3>
              저장한 코스 <span>({savedCourses.length})</span>
            </h3>
          </header>

          <div className="saved-list">
            {savedCourses.map((course) => (
              <div key={course.dipId} className="saved-item">
                <LogCard
                  type="saved"
                  item={course}
                  isOpen={openSavedIds[course.dipId]}
                  onMainButton={() =>
                    setOpenSavedIds((p) => ({
                      ...p,
                      [course.dipId]: !p[course.dipId],
                    }))
                  }
                  
                  onDelete={() => handleRemoveDip(course)}
                />

                {openSavedIds[course.dipId] && (
                  <div className="input-form-large">
                    <p className="form-title">완주 기록 입력</p>

                    <div className="runlog-inline-row">
                      <div className="form-row">
                        <label>날짜</label>
                        <input
                          className="input-small"
                          type="date"
                          value={inputValues[course.dipId]?.date || ""}
                          onChange={(e) =>
                            updateInput(course.dipId, "date", e.target.value)
                          }
                        />
                      </div>

                      <div className="form-row">
                        <label>시간</label>
                        <input
                          className="input-small"
                          type="text"
                          placeholder="HH:MM:SS (1234입력 -> 00:12:34)"
                          value = {timeValue}
                          onChange={(e) => {
                            const onlyNums = e.target.value.replace(/\D/g, "");
                            setTimeValue(onlyNums);
                            const formatted = formatToTime(e.target.value);
                            updateInput(course.dipId, "time", formatted);
                          }}
                          onKeyDown={(e) => {
                            // 숫자, 백스페이스, 탭 등만 허용
                            const allowed = [
                              "Backspace",
                              "Delete",
                              "Tab",
                              "ArrowLeft",
                              "ArrowRight",
                            ];
                            if (allowed.includes(e.key)) return;

                            // 숫자가 아니면 입력 막기
                            if (!/^[0-9]$/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          maxLength={6}
                        />
                      </div>

                      <button
                        className="btn btn-main btn-medium btn-hover-float"
                        onClick={() => submitFinish(course)}
                      >
                        저장
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {savedCourses.length === 0 && (
              <p className="empty">저장한 코스가 없습니다.</p>
            )}
          </div>
        </section>

        {/* 완주 기록 */}
        <section className="section-box">
          <header className="title-section">
            <h3>
              완주 기록 <span>({records.length})</span>
            </h3>
          </header>

          <div className="record-list">
            {records.map((record) => (
              <div key={record.id} className="record-item">
                <LogCard
                  type="record"
                  item={record}
                  isOpen={editingRecordIds[record.id]}
                  onMainButton={() =>
                    setEditingRecordIds((p) => ({
                      ...p,
                      [record.id]: !p[record.id],
                    }))
                  }
                  onCancel={() => deleteRec(record)}
                />

                {editingRecordIds[record.id] && (
                  <div className="input-form-large">
                    <p className="form-title">기록 수정</p>

                    <div className="runlog-inline-row">
                      <div className="form-row">
                        <label>날짜</label>
                        <input
                          className="input-small"
                          type="date"
                          defaultValue={record.rawDate}
                          onChange={(e) =>
                            updateEditInput(record.id, "date", e.target.value)
                          }
                        />
                      </div>

                      <div className="form-row">
                        <label>시간</label>
                        <input
                          inputMode="numeric"
                          className="input-small"
                          type="text"
                          placeholder="HH:MM:SS"
                          defaultvalue={""}
                          value = {editTimeValue}
                          onChange={(e) => {
                            const onlyNums = e.target.value.replace(/\D/g, "");
                            setEditTimeValue(onlyNums);
                            const formatted = formatToTime(e.target.value);
                            updateEditInput(record.id, "time", formatted);
                          }}
                          onKeyDown={(e) => {
                            // 숫자, 백스페이스, 탭 등만 허용
                            const allowed = [
                              "Backspace",
                              "Delete",
                              "Tab",
                              "ArrowLeft",
                              "ArrowRight",
                            ];
                            if (allowed.includes(e.key)) return;

                            // 숫자가 아니면 입력 막기
                            if (!/^[0-9]$/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          maxLength={6}
                          
                        />
                      </div>

                      <button
                        className="btn btn-accent btn-medium btn-hover-float"
                        onClick={() => submitEditRecord(record)}
                      >
                        수정 완료
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
