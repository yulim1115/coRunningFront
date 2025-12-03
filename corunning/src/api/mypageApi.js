import axios from "axios";
import { useState } from "react";

//아이디로 회원정보 가져오기
export const getUserAPI = async (userId) => {
    try {
        const response = await axios.get(`/api/users/${userId}`, {withCredentials: true});          
        console.log("회원정보 조회 API 응답:", response.data);
        return response.data;
    } catch (error) {
        console.error("회원정보 조회 실패:", error);
        throw error;
    }   
};

//회원정보 수정하기
export const updateUserAPI = async (userData) => {
    try {
        const response = await axios.put("/api/users/${userId}", userData, {withCredentials: true})
        console.log("프로필/계정 정보 수정 API 응답:", response.data);
        return response.data;
    } catch (error) {
        console.error("프로필/계정 정보 수정 실패:", error);
        throw error;
    }   
};

// 로그아웃
export const logoutAPI = async () => {
    try {
        const response = await axios.post("/api/users/logout", {}, {withCredentials: true});
        return response.data;
    } catch (error) {
        console.error("로그아웃에 실패했습니다: ", error);
        throw error;
    }
};