import axios from "axios";
import { useState} from "react";

const API_BASE = "/api/crew-board";

// 크루 생성 
export const crewCreateAPI = async (data) => {
    return axios.post(API_BASE, data, {withCredentials: true});
}

// 크루 목록 조회
export  const getCrewList = async() =>{
    try {
      const response = await axios.get(API_BASE)
      return response.data;
    }catch (error) {
      console.error("크루 목록 조회 실패:", error);
      throw error;
    }}

// 크루 상세 조회
export const getCrewDetailAPI = async(id) => {
  try{
    const response = await axios.get(`${API_BASE}/${id}`);
    console.log("크루상세정보 API 응답:", response.data);
    return response.data;
  }catch (error){
    console.error("크루 상세 조회 실패:", error);
    throw error;
  }
  
}

// 크루 신청
export const applyCrewAPI = async (id) => {
    try {   
        const response = await axios.post(`${API_BASE}/${id}/apply`, {}, {withCredentials: true});
        console.log("크루신 API 응답:", response.data);
        return response.data;
    } catch (error) {
        console.error("크루 신청 실패:", error);
        throw error;
    }   
}

// 크루 신청 취소
export const cancelApplyCrewAPI = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE}/${id}/apply`, {withCredentials: true});
        return response.data;
    } catch (error) {
        console.error("크루 신청 취소 실패:", error);
        throw error;
    }
} 
// 댓글 등록
export const postCrewCommentAPI = async (crewId, commentData) => {
    try {
        const response = await axios.post(`${API_BASE}/${crewId}/comments`, commentData, {withCredentials: true});      
        return response.data;
    } catch (error) {
        console.error("크루 댓글 등록 실패:", error);
        if (error.response) {
          console.error("서버 응답:", error.response.data);
  }
        throw error;
    } 
}


//댓글 목록 조회
export const getCrewCommentsAPI = async (crewId) => {
    try {
        const response = await axios.get(`${API_BASE}/${crewId}/comments`); 
        return response.data;
    } catch (error) {
        console.error("크루 댓글 목록 조회 실패:", error);
        throw error;
    } 
}

