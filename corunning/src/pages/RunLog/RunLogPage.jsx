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
  deleteRecord,
  uploadImage
} from "../../api/logApi";

export default function RunLogPage() {

    const [savedCourses, setSavedCourses] = useState([]);
    const [records, setRecords] = useState([]);

    const [openSavedId, setOpenSavedId] = useState(null);
    const [showNewRecordForm, setShowNewRecordForm] = useState(false);
    const [editingRecordId, setEditingRecordId] = useState(null);

    useEffect(() => {
        loadSavedCourses();
        loadRecords();
    }, []);

    const loadSavedCourses = async () => {
        const data = await getSavedCourses();
        setSavedCourses(
            data.map(d => ({
                id: d.routeId,
                title: d.route,
                location: d.location,
                distance: d.distance + " KM",
                level: d.level ?? "기본"
            }))
        );
    };

    const loadRecords = async () => {
        const data = await getRecords();
        setRecords(
            data.map(r => ({
                id: r.recordId,
                title: r.courseName,
                location: r.location,
                distance: r.distance + " KM",
                rawDate: r.runDate,
                date: r.runDate.replace(/-/g, "."),
                time: r.runTime,
                imageUrl: r.imageUrl
            }))
        );
    };

    return (
        <div className="runlog-wrapper">
            <h2 className="runlog-title">Run Log</h2>

            {/* 저장한 코스 */}
            <div className="section-box">
                <div className="section-header">
                    <h3>저장한 코스 <span>(총 {savedCourses.length}개)</span></h3>
                </div>

                {savedCourses.map(course => (
                    <div key={course.id}>
                        <LogCard
                            type="saved"
                            item={course}
                            isOpen={openSavedId === course.id}
                            onMainButton={() =>
                                setOpenSavedId(
                                    openSavedId === course.id ? null : course.id
                                )
                            }
                            onDelete={() => console.log("삭제", course.id)}
                        />

                        {openSavedId === course.id && (
                            <div className="input-form">
                                <p className="form-title">기록 입력: {course.title}</p>

                                <div className="three-grid">
                                    <div className="form-row">
                                        <label>필수 입력 1: 완주 날짜</label>
                                        <input type="date" />
                                    </div>

                                    <div className="form-row">
                                        <label>필수 입력 2: 완주 시간</label>
                                        <input type="text" placeholder="예: 01:30:05" />
                                    </div>

                                    <div className="form-row">
                                        <label>필수 입력 3: 인증 사진</label>
                                        <div className="upload-box" >📷 인증 사진 업로드 (클릭)</div>
                                    </div>
                                </div>

                                <button className="btn-submit">완주 완료 버튼</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 완주 기록 */}
            <div className="section-box">
                <div className="section-header">
                    <h3>코스 완주 기록 <span>(총 {records.length}개)</span></h3>

                    <button
                        className="btn-add"
                        onClick={() => setShowNewRecordForm(!showNewRecordForm)}
                    >
                        {showNewRecordForm ? "닫기" : "+ 새 완주 기록 추가"}
                    </button>
                </div>

                {showNewRecordForm && (
                    <div className="input-form-large">
                        <p className="form-title">자율 완주 기록 (코스명 직접 입력)</p>

                        <div className="two-cols">
                            <div className="form-row">
                                <label>코스 이름 (필수)</label>
                                <input type="text" placeholder="예: 우리 동네 한 바퀴" />
                            </div>

                            <div className="form-row">
                                <label>러닝 거리 (KM)</label>
                                <input type="text" placeholder="예: 5.5" />
                            </div>
                        </div>

                        <div className="three-grid">
                            <div className="form-row">
                                <label>완주 날짜</label>
                                <input type="date" />
                            </div>

                            <div className="form-row">
                                <label>완주 시간</label>
                                <input type="text" placeholder="01:30:05" />
                            </div>

                            <div className="form-row">
                                <label>인증 사진</label>
                                <div className="upload-box">📷 인증 사진 업로드 (클릭)</div>
                            </div>
                        </div>

                        <button className="btn-submit">기록 저장</button>
                    </div>
                )}

                {records.map(record => (
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
                            onDelete={() => console.log("삭제", record.id)}
                        />

                        {editingRecordId === record.id && (
                            <div className="edit-form">
                                <p className="form-title">기록 수정: {record.title}</p>

                                <div className="three-grid">
                                    <div className="form-row">
                                        <label>완주 날짜</label>
                                        <input type="date" defaultValue={record.rawDate} />
                                    </div>

                                    <div className="form-row">
                                        <label>완주 시간</label>
                                        <input type="text" defaultValue={record.time} />
                                    </div>

                                    <div className="form-row">
                                        <label>인증 사진 (현재 파일: photo.jpg)</label>
                                        <div className="upload-box">📷 사진 변경 (클릭)</div>
                                    </div>
                                </div>

                                <button className="btn-submit">수정 완료</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
