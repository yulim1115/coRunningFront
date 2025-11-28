import axios from "axios";

const API_BASE = "/api/runlog";

// 저장한 코스
export const getSavedCourses = () =>
    axios.get(`${API_BASE}/saved`).then(res => res.data);

// 자신의 완주 기록
export const getRecords = () =>
    axios.get(`${API_BASE}/records`).then(res => res.data);

// 완주 기록 저장
export const finishCourse = (data) =>
    axios.post(`${API_BASE}/finish`, data).then(res => res.data);

// 자율 기록 저장
export const createRecord = (data) =>
    axios.post(`${API_BASE}/save-record`,data).then(res => res.data);

// 기록 수정
export const updateRecord = (recordId, data) =>
    axios.put(`${API_BASE}/records/${recordId}`).then(res => res.data);

// 기록 삭제
export const deleteRecord = (recordId) =>
    axios.delete(`${API_BASE}/records/${recordId}`).then(res => res.data);

// 파일 업로드
export const uploadImage = (file) => {
    const form = new FormData();
    form.append("image",file);

    return axios.post(`${API_BASE}/upload`,form, {
        headers: {"Content-Type" : "multipart/form-data"}
    }).then(res => res.data);
};