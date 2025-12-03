import axios from "axios";

// 현재 로그인한 사용자 ID(이메일) 불러오기
// 세션 확인
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
    .post(`api/dip/add`, {
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
    .get(`/api/dip/list`, {
      params: { userId: getUserId() } // 백엔드에서 userId 필요할 수 있어서 같이 전송
    })
    .then((res) => res.data);

// ==========================
//  완주 기록 목록 조회
// ==========================
export const getRecords = (userId) =>
  axios
    .get(`/api/run/records`, {
      params: { userId: getUserId() }
    })
    .then((res) => res.data.map(mapRecord));

// ==========================
//  저장한 코스 → 완료 기록 생성
// ==========================
export const finishCourse = (data) =>
  axios
    .post(`/api/run/finish`, {
      ...data,
      userId: getUserId(),
    })
    .then((res) => res.data);

// ==========================
//  자율 완주 기록 생성
// ==========================
export const createRecord = (data) =>
  axios
    .post(`/api/run/save-record`, {
      ...data,
      userId: getUserId(),
    })
    .then((res) => res.data);

// ==========================
//  기록 수정
// ==========================
export const updateRecord = (id, data) =>
  axios
    .put(`/api/run/records/${id}`, {
      ...data,
      userId: getUserId(),
    })
    .then((res) => res.data);

// ✅ 기록 삭제
export const deleteRecord = (recordId) =>
  axios
    .delete(`/api/run/records/${recordId}`, {
      params: { userId: getUserId() }
    })
    .then((res) => res.data);