// src/pages/RunLog/RunLogPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LogCard from "../../components/cards/LogCard";
import "./RunLogPage.css";
import Skeleton from "./RunLogSkeleton";
import RegionSelector from "../../components/common/RegionSelector";

import {
  addCustomDip,
  getDipList,
  getRouteById,
  removeDip,
  updateDip,
} from "../../api/routesApi";

import { FaPlus } from "react-icons/fa";

export const formatToTime = (value) => {
  const str = String(value ?? "");
  // 숫자만 남기기
  const numeric = str.replace(/\D/g, "").slice(0, 6);

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

  return hh >= 0 && mm >= 0 && mm < 60 && ss >= 0 && ss < 60;
};

const showSuccess = (msg) => {
  window.Swal.fire({
    icon: "success",
    title: "성공",
    text: msg,
    confirmButtonColor: "#0f1c2e",
  });
};

const showError = (msg) => {
  window.Swal.fire({
    icon: "error",
    title: "오류",
    text: msg,
    confirmButtonColor: "#0f1c2e",
  });
};

const confirmDelete = async () => {
  return window.Swal.fire({
    title: "삭제하시겠습니까?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#0f1c2e",
    confirmButtonText: "확인",
    cancelButtonText: "취소",
  });
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
  const [inputValues, setInputValues] = useState({});
  const [editValues, setEditValues] = useState({});
  const [editTitle, setEditTitle] = useState({});
  const [editDistance, setEditDistance] = useState({});
  const [editLocation, setEditLocation] = useState({});
  const [newCustomOpen, setNewCustomOpen] = useState(false);
  const [newCustom, setNewCustom] = useState({
    title: "",
    distance: "",
    location: "",
    date: "",
    hh: "",
    mm: "",
    ss: "",
  });

  const handleNewCustomChange = (field, value) => {
    setNewCustom((prev) => ({ ...prev, [field]: value }));
  };

  const submitNewCustom = async () => {
    const { title, distance, location, date, hh, mm, ss } = newCustom;
    if (!title || !distance || !location || !date)
      return showError("모든 값을 입력해주세요.");
    if (Number(mm) > 59 || Number(ss) > 59)
      return showError("분과 초는 0~59여야 합니다.");
    const resolvedLocation =
      typeof location === "string"
        ? location
        : `${location.sido ?? ""} ${location.gu ?? ""}`.trim();
    const time = `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:${ss.padStart(
      2,
      "0"
    )}`;
    const recordStr = `${date} ${time}`;
    try {
      showSuccess("자율 기록이 추가되었습니다!");
      newCustom.title = "";
      newCustom.distance = "";
      newCustom.location = "";
      newCustom.date = "";
      newCustom.hh = "";
      newCustom.mm = "";
      newCustom.ss = "";
      setNewCustomOpen(false);
      await addCustomDip(title, distance, resolvedLocation, recordStr);
      await loadData();
    } catch (err) {
      showError("자율 기록 추가에 실패했습니다.");
    }
  };

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
            routeId: dip.routeId, // null 일 수 있음
            title: route?.title || dip.title || "커스텀 코스",
            location: parseLocation(
              route?.location || dip.location || "자율기록"
            ),
            distance:
              typeof route?.distance === "number"
                ? route.distance
                : dip.distance || 0,
            level: route?.difficulty || dip.difficulty || "자율기록",
            complete: dip.complete === true,
            record: dip.record || "",
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
              location: parseLocation(c.location),
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
  const parseLocation = (locStr) => {
    // 이미 객체라면 그대로 반환
    if (typeof locStr === "object" && locStr !== null) return locStr;

    // 문자열이 아닐 경우 기본값 반환
    if (typeof locStr !== "string") return { sido: "", gu: "" };

    // 문자열이지만 "자율기록" 같은 경우 단일 존재 → gu 없이 반환
    const parts = locStr.split(" ");
    return {
      sido: parts[0] || "",
      gu: parts[1] || "",
    };
  };

  useEffect(() => {
    if (!userId) {
      showError("로그인 후 이용해주세요.");
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
    const { date, hh, mm, ss } = inputValues[course.dipId] || {};

    if (!date || !hh || !mm || !ss)
      return showError("날짜와 시간을 모두 입력해주세요.");

    if (Number(mm) > 59 || Number(ss) > 59)
      return showError("분과 초는 0~59여야 합니다.");

    const time = `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:${ss.padStart(
      2,
      "0"
    )}`;
    const record = `${date} ${time}`;
    const newTitle =
      editTitle[course.dipId] !== undefined
        ? editTitle[course.dipId]
        : course.title;
    try {
      await updateDip(course.dipId, true, record, newTitle);

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
      showSuccess("기록이 저장되었습니다!");

      setOpenSavedIds((prev) => ({ ...prev, [course.dipId]: false }));
    } catch (err) {
      showError("저장 실패: " + err.message);
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
    const rawH = editValues[record.id]?.hh;
    const rawM = editValues[record.id]?.mm;
    const rawS = editValues[record.id]?.ss;

    // 숫자든 빈 문자열이든 상관없이 → 문자열로 강제 변환
    const hh = String(rawH ?? "0");
    const mm = String(rawM ?? "0");
    const ss = String(rawS ?? "0");

    const date = editValues[record.id]?.date || record.rawDate;
    if (Number(mm) > 59 || Number(ss) > 59)
      return showError("분과 초는 0~59여야 합니다.");

    const newTime = `${hh.padStart(2, "0")}:${mm.padStart(
      2,
      "0"
    )}:${ss.padStart(2, "0")}`;
    const newRecordStr = `${date} ${newTime}`;
    const newTitle =
      editTitle[record.id] !== undefined ? editTitle[record.id] : record.title;
    const distance =
      editDistance[record.id] !== undefined
        ? editDistance[record.id]
        : record.distance;
    const locationObj = editLocation[record.id];
    const resolvedLocation =
      typeof locationObj === "string"
        ? locationObj
        : `${locationObj?.sido ?? ""} ${locationObj?.gu ?? ""}`.trim();

    try {
      await updateDip(
        record.id,
        true,
        newRecordStr,
        newTitle,
        distance,
        resolvedLocation
      );

      setRecords((prev) =>
        prev.map((r) =>
          r.id === record.id
            ? {
                ...r,
                rawDate: date,
                date: date.replace(/-/g, "."),
                time: newTime,
              }
            : r
        )
      );

      showSuccess("기록이 수정되었습니다!");
      await loadData();
      setEditingRecordIds((p) => ({ ...p, [record.id]: false }));
    } catch (err) {
      showError("수정 실패: " + err.message);
    }
  };

  // 기록 삭제 후 저장한 코스로 되돌리기
  const deleteRec = async (record) => {
    const res = await confirmDelete();
    if (!res.isConfirmed) return;
    const location = record.location;
    const resolvedLocation =
      typeof location === "string"
        ? location
        : `${location.sido ?? ""} ${location.gu ?? ""}`.trim();

    try {
      await updateDip(
        record.dipId,
        false,
        "",
        record.title,
        record.distance,
        resolvedLocation
      );

      setRecords((prev) => prev.filter((r) => r.id !== record.id));

      const restoredItem = {
        dipId: record.dipId,
        routeId: record.routeId,
        title: record.title,
        location: record.location,
        distance: record.distance,
        level: record.level,
        complete: false,
        record: "",
      };

      setSavedCourses((prev) => [...prev, restoredItem]);

      showSuccess("기록이 삭제되었습니다!");
    } catch (err) {
      showError("삭제 실패: " + err.message);
    }
  };

  // 찜 삭제
  const handleRemoveDip = async (course) => {
    const res = await confirmDelete();
    if (!res.isConfirmed) return;
    try {
      await removeDip(course.dipId); // dipId로 바로 삭제!
      setSavedCourses((prev) => prev.filter((c) => c.dipId !== course.dipId));
      await loadData();
    } catch (err) {
      showError("삭제 실패: " + err.message);
    }
  };

  // 로딩 화면
  if (loading) return <Skeleton />;

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
                      {course.routeId === null && (
                        <>
                          <div className="form-row">
                            <label>제목</label>
                            <input
                              className="input-small"
                              value={editTitle[course.dipId] ?? course.title}
                              onChange={(e) =>
                                setEditTitle((prev) => ({
                                  ...prev,
                                  [course.dipId]: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="form-row">
                            <label>거리</label>
                            <input
                              className="input-small"
                              value={
                                editDistance[course.dipId] ?? course.distance
                              }
                              onChange={(e) =>
                                setEditDistance((prev) => ({
                                  ...prev,
                                  [course.dipId]: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
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
                        <div className="time-split-row">
                          <input
                            className="input-tiny"
                            type="text"
                            placeholder="HH"
                            maxLength={2}
                            value={inputValues[course.dipId]?.hh || ""}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, "");
                              updateInput(course.dipId, "hh", v);
                            }}
                          />
                          <span>:</span>
                          <input
                            className="input-tiny"
                            type="text"
                            placeholder="MM"
                            maxLength={2}
                            value={inputValues[course.dipId]?.mm || ""}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, "");
                              updateInput(course.dipId, "mm", v);
                            }}
                          />
                          <span>:</span>
                          <input
                            className="input-tiny"
                            type="text"
                            placeholder="SS"
                            maxLength={2}
                            value={inputValues[course.dipId]?.ss || ""}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, "");
                              updateInput(course.dipId, "ss", v);
                            }}
                          />
                        </div>
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

            <button
              className={`add-custom-text ${newCustomOpen ? "active" : ""}`}
              onClick={() => setNewCustomOpen((p) => !p)}
            >
              <FaPlus className="add-icon" />
              <span>자율 기록 추가</span>
            </button>
          </header>

          {/* 자율 기록 입력 카드 → 완주 기록 맨 위 */}
          {newCustomOpen && (
            <div className="input-form-large">
              <p className="form-title">자율 기록 입력</p>

              {/* 제목 - 한 줄 */}
              <div className="runlog-inline-row">
                <div className="form-row">
                  <label>제목</label>
                  <input
                    className="input-small"
                    value={newCustom.title}
                    onChange={(e) =>
                      handleNewCustomChange("title", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* 거리 + 지역 - 한 줄 */}
              <div className="runlog-inline-row">
                <div className="form-row">
                  <label>거리</label>
                  <input
                    className="input-small"
                    value={newCustom.distance}
                    onChange={(e) =>
                      handleNewCustomChange("distance", e.target.value)
                    }
                  />
                </div>
                <div className="form-row">
                  <label>지역</label>
                  <RegionSelector
                    value={newCustom.location}
                    onChange={(v) => handleNewCustomChange("location", v)}
                  />
                </div>
              </div>

              {/* 날짜 + 시간 - 한 줄 */}
              <div className="runlog-inline-row">
                <div className="form-row">
                  <label>날짜</label>
                  <input
                    type="date"
                    className="input-small"
                    value={newCustom.date}
                    onChange={(e) =>
                      handleNewCustomChange("date", e.target.value)
                    }
                  />
                </div>

                <div className="form-row">
                  <label>시간</label>
                  <div className="time-split-row">
                    <input
                      className="input-tiny"
                      placeholder="HH"
                      maxLength={2}
                      value={newCustom.hh}
                      onChange={(e) =>
                        handleNewCustomChange(
                          "hh",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                    />
                    <span>:</span>

                    <input
                      className="input-tiny"
                      placeholder="MM"
                      maxLength={2}
                      value={newCustom.mm}
                      onChange={(e) =>
                        handleNewCustomChange(
                          "mm",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                    />
                    <span>:</span>

                    <input
                      className="input-tiny"
                      placeholder="SS"
                      maxLength={2}
                      value={newCustom.ss}
                      onChange={(e) =>
                        handleNewCustomChange(
                          "ss",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                    />
                  </div>
                </div>

                <button
                  className="btn btn-accent btn-medium btn-hover-float"
                  onClick={submitNewCustom}
                >
                  추가
                </button>
              </div>
            </div>
          )}

          <div className="record-list ">
            {records.map((record) => (
              <div key={record.dipId} className="record-item">
                {record.routeId ? (
                  <LogCard
                    type="record"
                    item={record}
                    isOpen={editingRecordIds[record.dipId]}
                    onMainButton={() =>
                      setEditingRecordIds((p) => ({
                        ...p,
                        [record.dipId]: !p[record.dipId],
                      }))
                    }
                    onCancel={() => deleteRec(record)}
                  />
                ) : (
                  <LogCard
                    type="custom"
                    item={record}
                    isOpen={editingRecordIds[record.dipId]}
                    onMainButton={() =>
                      setEditingRecordIds((p) => ({
                        ...p,
                        [record.dipId]: !p[record.dipId],
                      }))
                    }
                    onDelete={() => handleRemoveDip(record)}
                  />
                )}
                {editingRecordIds[record.dipId] && (
                  <div className="input-form-large">
                    <p className="form-title">기록 수정</p>
                    {record.routeId === null && (
                      <>
                        <div className="runlog-inline-row">
                          <div className="form-row">
                            <label>제목</label>
                            <input
                              className="input-small"
                              value={editTitle[record.dipId] ?? record.title}
                              onChange={(e) =>
                                setEditTitle((prev) => ({
                                  ...prev,
                                  [record.dipId]: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="form-row">
                            <label>거리</label>
                            <input
                              className="input-small"
                              value={
                                editDistance[record.dipId] ?? record.distance
                              }
                              onChange={(e) =>
                                setEditDistance((prev) => ({
                                  ...prev,
                                  [record.dipId]: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="runlog-inline-row">
                          <div className="runlog-inline-row">
                            <div className="form-row">
                              <label>지역</label>
                              <RegionSelector
                                value={record.location}
                                onChange={(value) =>
                                  setEditLocation((prev) => ({
                                    ...prev,
                                    [record.dipId]: value,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="runlog-inline-row">
                      <div className="form-row">
                        <div className="runlog-inline-row"></div>
                        <label>날짜</label>
                        <input
                          className="input-small"
                          type="date"
                          defaultValue={record.rawDate}
                          onChange={(e) =>
                            updateEditInput(
                              record.dipId,
                              "date",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-row">
                        <label>시간</label>
                        <div className="time-split-row">
                          <input
                            className="input-tiny"
                            type="text"
                            placeholder="HH"
                            maxLength={2}
                            defaultValue={record.time?.split(":")[0]}
                            onChange={(e) =>
                              updateEditInput(
                                record.dipId,
                                "hh",
                                e.target.value.replace(/\D/g, "")
                              )
                            }
                          />
                          <span>:</span>

                          <input
                            className="input-tiny"
                            type="text"
                            placeholder="MM"
                            maxLength={2}
                            defaultValue={record.time?.split(":")[1]}
                            onChange={(e) =>
                              updateEditInput(
                                record.id,
                                "mm",
                                e.target.value.replace(/\D/g, "")
                              )
                            }
                          />
                          <span>:</span>

                          <input
                            className="input-tiny"
                            type="text"
                            placeholder="SS"
                            maxLength={2}
                            defaultValue={record.time?.split(":")[2]}
                            onChange={(e) =>
                              updateEditInput(
                                record.id,
                                "ss",
                                e.target.value.replace(/\D/g, "")
                              )
                            }
                          />
                        </div>
                      </div>

                      <button
                        className="btn btn-accent btn-medium btn-hover-float"
                        onClick={() => submitEditRecord(record)}
                      >
                        수정
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
