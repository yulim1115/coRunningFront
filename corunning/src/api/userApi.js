import axios from "axios";

const API_BASE = "/api/users";

// 회원가입
export const signUpAPI = (data) => {
  return axios.post(API_BASE, data);
};

// 로그인
export const loginAPI = (data) => {
  return axios.post(`${API_BASE}/login`, data, {
    withCredentials: true, // JSESSIONID 쿠키 포함 (백엔드 세션 사용시)
  });
};

export const logoutAPI = () =>{
  return axios.post(`${API_BASE}/logout`, {}, {withCredentials: true});
}
// 내 정보 갖고 오기
export const getMyInfo = async() => {
  return axios.get(`${API_BASE}/me`, {withCredentials: true});
};

// 내 정보 수정하기
export const updateUserInfo = async(data) => {
  return axios.put(`${API_BASE}/update-info`,data,{withCredentials: true});
};

// 비밀번호 수정하기
export const updatePassword = async(userId, newPw) => {
  return axios.put(`${API_BASE}/pw`,null, {params: { userId, newPw }});
};



// 모든 정보 갖고 오기
export const nameCheckAPI = async(data) =>{
  return axios.get(`${API_BASE}/name`,  {params: { userName: data},  withCredentials: true});
}