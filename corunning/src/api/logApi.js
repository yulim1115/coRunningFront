import axios from "axios";

const BACKEND_BASE = "http://localhost:8080";
const API_BASE_DIP = `${BACKEND_BASE}/api/dip`;
const API_BASE_RUN = `${BACKEND_BASE}/api/run`;

// 현재 로그인한 사용자 ID(이메일) 불러오기
// 세션/로컬 둘 다 확인
const getUserId = () =>
  sessionStorage.getItem("userEmail");

// ==========================
//  DB → 프런트 표시용 변환
// ==========================
const mapRecord = (rec) => ({
  id: rec.id,
  title: rec.title,
  location: rec.location,
  distance: rec.distance,
  rawDate: rec.runDate,
  date: rec.runDate ? rec.runDate.replace(/-/g, ".") : "",
  time: rec.runTime,
});

// ==========================
//  코스 저장 (디핑)
// ==========================
export const saveRoute = (route) =>
  axios
    .post(`${API_BASE_DIP}/add`, {
      userId: getUserId(),
      routeId: route.id,
      title: route.title,
      location: route.location,
      level: route.level,
      distance: route.distance,
    })
    .then((res) => res.data);

// ==========================
//  저장한 코스 목록 조회
// ==========================
export const getSavedCourses = () =>
  axios
    .get(`${API_BASE_DIP}/list`, {
      params: { userId: getUserId() },
    })
    .then((res) => res.data);

// ==========================
//  완주 기록 목록 조회
// ==========================
export const getRecords = (userId) =>
  axios
    .get(`${API_BASE_RUN}/records`, {
      params: { userId },
    })
    .then((res) => res.data.map(mapRecord));

// ==========================
//  저장한 코스 → 완료 기록 생성
// ==========================
export const finishCourse = (data) =>
  axios
    .post(`${API_BASE_RUN}/finish`, {
      ...data,
      userId: getUserId(),
    })
    .then((res) => res.data);

// ==========================
//  자율 완주 기록 생성
// ==========================
export const createRecord = (data) =>
  axios
    .post(`${API_BASE_RUN}/create`, {
      ...data,
      userId: getUserId(),
    })
    .then((res) => res.data);

// ==========================
//  기록 수정
// ==========================
export const updateRecord = (id, data) =>
  axios
    .put(`${API_BASE_RUN}/update/${id}`, {
      ...data,
      userId: getUserId(),
    })
    .then((res) => res.data);

// ==========================
//  기록 삭제
// ==========================
export const deleteRecord = (id, userId) => {
  return axios
    .delete(`${API_BASE_RUN}/records/${id}`, {
      params: { userId },
    })
    .then((res) => res.data);
  };