// src/pages/RunRoutes/RunLogPage.jsx
import React, { useState, useEffect } from "react";
import {
  getRecords,
  finishCourse,
  createRecord,
  updateRecord,
  deleteRecord,
  getSavedCourses,
} from "../../api/logApi";
import LogCard from "../../components/cards/LogCard";
import "./RunLogPage.css";

export default function RunLogPage() {
  const [userId, setUserId] = useState(null);

  const [savedCourses, setSavedCourses] = useState([]);
  const [records, setRecords] = useState([]);

  const [openSavedId, setOpenSavedId] = useState(null);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [showNewRecordForm, setShowNewRecordForm] = useState(false);

  const [newRecord, setNewRecord] = useState({
    title: "",
    location: "",
    distance: "",
    date: "",
    time: "",
  });

  const [finishInput, setFinishInput] = useState({
    date: "",
    time: "",
  });

  // 로그인 정보 불러오기
  useEffect(() => {
    const stored =
      sessionStorage.getItem("userEmail") || localStorage.getItem("user_id");
    setUserId(stored);
  }, []);

  // 로그인 여부에 따라 데이터 로딩
  useEffect(() => {
    if (userId) {
      loadSaved();
      loadRecords(userId);
    } else {
      setSavedCourses([]);
      setRecords([]);
    }
  }, [userId]);

  // 저장한 코스 로딩
  const loadSaved = async () => {
    try {
<<<<<<< Updated upstream
      const saved = await getSavedCourses();
      setSavedCourses(saved || []);
=======
      const data = await getSavedCourses();
      setSavedCourses(
        data.map((d) => ({
          id: d.routeId,
          title: d.title,
          location: d.location,
          distance: d.distance,
          level: d.level ?? "기본"
        }))
      );
>>>>>>> Stashed changes
    } catch (err) {
      console.error("저장코스 조회 실패", err);
      setSavedCourses([]);
    }
  };

  // 완주 기록 로딩
  const loadRecords = async (uid) => {
    try {
<<<<<<< Updated upstream
      const dbRecords = await getRecords(uid);
      setRecords(dbRecords || []);
=======
      const data = await getRecords();
      setRecords(
        data.map((r) => ({
          id: r.recordId,
          title: r.title,
          distance: r.distance,
          location: r.location,
          rawDate: r.date,
          date: r.date.replace(/-/g, "."),
          time: r.time
        }))
      );
>>>>>>> Stashed changes
    } catch (err) {
      console.error("기록 조회 실패", err);
      setRecords([]);
    }
  };

  // 저장한 코스 → 완주 처리
  const handleFinishCourse = async (saved) => {
    if (!finishInput.date || !finishInput.time) {
      alert("완주 날짜와 시간을 입력하세요.");
      return;
    }

    try {
      await finishCourse({
        routeId: saved.routeId || saved.id,
        title: saved.title,
        location: saved.location,
        distance: saved.distance,
        runDate: finishInput.date,
        runTime: finishInput.time,
      });

      alert("완주 기록이 저장되었습니다.");
      setOpenSavedId(null);
      setFinishInput({ date: "", time: "" });
      loadRecords(userId);
    } catch (err) {
      console.error("완주 처리 실패", err);
      alert("완주 처리에 실패했습니다.");
    }
  };

  // 자율 완주 기록 생성
  const handleCreateRecord = async () => {
    const { title, location, distance, date, time } = newRecord;

    if (!title || !location || !distance || !date || !time) {
      alert("모든 필드를 입력해야 합니다.");
      return;
    }

    try {
      await createRecord({
        title,
        location,
        distance: parseFloat(distance),
        runDate: date,
        runTime: time,
      });

      alert("자율 완주 기록 생성 완료!");
      setShowNewRecordForm(false);
      setNewRecord({
        title: "",
        location: "",
        distance: "",
        date: "",
        time: "",
      });
      loadRecords(userId);
    } catch (err) {
      console.error("자율 기록 생성 실패", err);
      alert("자율 기록 생성에 실패했습니다.");
    }
  };

  // 기록 수정
  
  const handleUpdateRecord = async (record) => {
    const data = {
        title: record.title,
        location: record.location,
        distance: parseFloat(record.distance),
        runDate: record.rawDate,
        runTime: record.time,
      }
    try {
      await updateRecord(record.id, data);

      console.log("수정 데이터 확인 :",record);
      setEditingRecordId(null);
      loadRecords(userId);
    } catch (err) {
      console.error("기록 수정 실패", err);
      alert("기록 수정에 실패했습니다.");
    }
  };

  // 기록 삭제
  const handleDeleteRecord = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteRecord(id, userId); // ★ userId 함께 전달
      alert("삭제되었습니다.");
      loadRecords(userId);
    } catch (err) {
      console.error("삭제 실패", err);
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="runlog-wrapper">
      <h2 className="runlog-title">Run Log</h2>

      {/* 저장한 코스 영역 */}
      <div className="section-box">
        <div className="section-header">
          <h3>
            저장한 코스 <span>(총 {savedCourses.length}개)</span>
          </h3>
        </div>

        {savedCourses.length === 0 && (
          <p className="empty-msg">저장한 코스가 없습니다.</p>
        )}

        {savedCourses.map((saved) => (
          <div key={saved.id}>
            <LogCard
              type="saved"
              item={saved}
              isOpen={openSavedId === saved.id}
              onMainButton={() =>
                setOpenSavedId(openSavedId === saved.id ? null : saved.id)
              }
              // 저장 코스 삭제를 run 기록 삭제 API로 할 생각이 아니면 onDelete 빼도 됨
              // onDelete={() => handleDeleteSavedCourse(saved.id)}
            />

            {openSavedId === saved.id && (
              <div className="input-form">
                <p className="form-title">기록 입력: {saved.title}</p>

                <div className="three-grid">
                  <div className="form-row">
                    <label>완주 날짜</label>
                    <input
                      type="date"
                      value={finishInput.date}
                      onChange={(e) =>
                        setFinishInput({ ...finishInput, date: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-row">
                    <label>완주 시간</label>
                    <input
                      type="text"
                      placeholder="01:30:05"
                      value={finishInput.time}
                      onChange={(e) =>
                        setFinishInput({ ...finishInput, time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <button
                  className="btn-submit"
                  onClick={() => handleFinishCourse(saved)}
                >
                  완주 완료
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 코스 완주 기록 영역 */}
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

        {/* 자율 기록 입력 폼 */}
        {showNewRecordForm && (
          <div className="input-form-large">
            <p className="form-title">자율 완주 기록</p>

            <div className="two-cols">
              <div className="form-row">
                <label>코스 이름</label>
                <input
                  type="text"
                  value={newRecord.title}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, title: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>지역</label>
                <input
                  type="text"
                  value={newRecord.location}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, location: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>거리(KM)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newRecord.distance}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      distance: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="three-grid">
              <div className="form-row">
                <label>날짜</label>
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, date: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>시간</label>
                <input
                  type="text"
                  placeholder="01:30:05"
                  value={newRecord.time}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, time: e.target.value })
                  }
                />
              </div>
            </div>

            <button className="btn-submit" onClick={handleCreateRecord}>
              기록 저장
            </button>
          </div>
        )}

        {/* 기존 기록 카드들 */}
        {records.length === 0 && (
          <p className="empty-msg">완주 기록이 없습니다.</p>
        )}

        {records.map((record) => (
          <div key={record.id}>
            <LogCard
              type="record"
              item={record}
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

                <div className="three-grid">
                  <div className="form-row">
                    <label>날짜</label>
                    <input
                      type="date"
                      defaultValue={record.rawDate}
                      onChange={(e) => (record.rawDate = e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <label>시간</label>
                    <input
                      type="text"
                      defaultValue={record.time}
                      onChange={(e) => (record.time = e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="btn-submit"
                  onClick={() => handleUpdateRecord(record)}
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
