import axios from "axios";
import { useState} from "react";

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
}

//회원정보 수정하기
export const updateUserAPI = async (userId, userData) => {
    try {
        const response = await axios.put(`/api/users/${userId}`, userData, {withCredentials: true})
        console.log("프로필/계정 정보 수정 API 응답:", response.data);
        return response.data;
    } catch (error) {
        console.error("프로필/계정 정보 수정 실패:", error);
        throw error;
    }   
}

//id로 코스 정보 가져오기
export const getRouteByIdAPI = async (userId) => {
    try {
        const response = await axios.get(`/api/routes/user/${userId}`, {withCredentials: true});          
        console.log("코스 정보 조회 API 응답:", response.data);
        return response.data;
    } catch (error) {
        console.error("코스 정보 조회 실패:", error);
        throw error;
    }  
}
//코스 삭제하기
export const deleteRouteAPI = async (routeId) => {
    try {   
        const response = await axios.delete(`/api/routes/${routeId}/remove`, {withCredentials: true})
        console.log("코스 삭제 API 응답:", response.data);
        return response.data;
    } catch (error) {
        console.error("코스 삭제 실패:", error);
        throw error;
    }       
}

//id로 크루 정보 가져오기
export const getCrewByIdAPI = async (userId) => {
    try {
        const response = await axios.get(`/api/crew-board/user/${userId}`, {withCredentials: true});
        console.log("크루 정보 조회 API 응답:", response.data);
        return response.data;
    } catch (error) {
        console.error("크루 정보 조회 실패:", error);
        throw error;
    }
}
//크루 삭제하기
export const deleteCrewAPI = async (crewId) => {
    try {   
        const response = await axios.delete(`/api/crew-board/${crewId}`, {withCredentials: true}) 
        console.log("크루 삭제 API 응답:", response.data);
        return response.data;
    } catch (error) {
        console.error("크루 삭제 실패:", error);
        throw error;
    }   
}
//신청자 명단 가져오기
export const getApplicationsAPI = async(crewId) => {
    try {
        const response = await axios.get(`/api/crew-board/${crewId}/applications`, {withCredentials: true})
        console.log("신청자 명단 가져오기 API 응답: ", response.data);
        return response.data;
    }catch (error){
        console.error("신청자 명단 가져오기 실패:", error);
        throw error;
    }
}

export const getDashBoardAPI = async () => {
    try {
        const response = await axios.get(`/api/mypage/dashboard`, {withCredentials: true});          
        console.log("대시보드 정보 조회 API 응답:", response.data);
        return response.data;
    }
    catch (error) {
        console.error("대시보드 정보 조회 실패:", error);
        throw error;
    }
}