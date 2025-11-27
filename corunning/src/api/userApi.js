// src/api/userApi.js
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
