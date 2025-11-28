import axios from "axios";

const API_BASE = "/api/routes";


// 로그인 시 localStorage에 userId를 저장했다고 가정
const getUserId = () => localStorage.getItem("user_id");

// ✅ 저장한 코스 목록 조회
export const getSavedCourses = () =>
  axios
    .get(`${API_BASE}/saved`, {
      params: { userId: getUserId() } // 백엔드에서 userId 필요할 수 있어서 같이 전송
    })
    .then((res) => res.data);

// ✅ 완주 기록 목록 조회
export const getRecords = () =>
  axios
    .get(`${API_BASE}/records`, {
      params: { userId: getUserId() }
    })
    .then((res) => res.data);

// ✅ 저장한 코스에서 "완주 완료" 기록 저장
// 기대하는 body 예시:
// { routeId: 3, runDate: "2025-11-28", runTime: "01:20:30", userId: "testUser" }
export const finishCourse = (data) =>
  axios
    .post(`${API_BASE}/finish`, {
      ...data,
      userId: getUserId()
    })
    .then((res) => res.data);

// ✅ 자율 완주 기록 추가 (위의 "새 완주 기록 추가" 버튼에서 사용)
export const createRecord = (data) =>
  axios
    .post(`${API_BASE}/save-record`, {
      ...data,
      userId: getUserId()
    })
    .then((res) => res.data);

// ✅ 기록 수정
export const updateRecord = (recordId, data) =>
  axios
    .put(`${API_BASE}/records/${recordId}`, {
      ...data,
      userId: getUserId()
    })
    .then((res) => res.data);

// ✅ 기록 삭제
export const deleteRecord = (recordId) =>
  axios
    .delete(`${API_BASE}/records/${recordId}`, {
      params: { userId: getUserId() }
    })
    .then((res) => res.data);