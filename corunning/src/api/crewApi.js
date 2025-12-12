/* crewApi.js */
import axios from "axios";

const API_BASE = "/api/crew-board";

/* 크루 생성 */
export const crewCreateAPI = async (data) => {
  return axios.post(API_BASE, data, { withCredentials: true });
};

/* 크루 목록 조회 */
export const getCrewList = async () => {
  try {
    const res = await axios.get(API_BASE);
    return res.data;
  } catch (err) {
    console.error("크루 목록 조회 실패:", err);
    throw err;
  }
};

/* 크루 상세 조회 */
export const getCrewDetailAPI = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/${id}`);
    return res.data;
  } catch (err) {
    console.error("크루 상세 조회 실패:", err);
    throw err;
  }
};

/* 크루 신청 */
export const applyCrewAPI = async (id) => {
  try {
    const res = await axios.post(
      `${API_BASE}/${id}/apply`,
      {},
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("크루 신청 실패:", err);
    throw err;
  }
};

/* 신청 상태 조회 */
export const checkApplicationAPI = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/check`, {
      params: { boardId: id },
      withCredentials: true,
    });
    return res.data; // true 또는 false
  } catch (err) {
    console.error("신청 상태 조회 실패:", err);
    return false; // 오류 시 기본값
  }
};

/* 댓글 등록 */
export const postCrewCommentAPI = async (crewId, commentData) => {
  try {
    const res = await axios.post(
      `${API_BASE}/${crewId}/comments`,
      commentData,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("크루 댓글 등록 실패:", err);
    throw err;
  }
};

/* 댓글 목록 조회 */
export const getCrewCommentsAPI = async (crewId) => {
  try {
    const res = await axios.get(`${API_BASE}/${crewId}/comments`);
    return res.data;
  } catch (err) {
    console.error("크루 댓글 목록 조회 실패:", err);
    throw err;
  }
};

/* 댓글 삭제 */
export const deleteCrewCommentAPI = async (commentId) => {
  try {
    const res = await axios.delete(`${API_BASE}/comments/${commentId}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    console.error("크루 댓글 삭제 실패:", err);
    throw err;
  }
};

//id로 크루 정보 가져오기
export const getCrewByIdAPI = async (userId) => {
    try {
        const response = await axios.get(`/api/crew-board/user/${userId}`, {withCredentials: true});
        return response.data;
    } catch (error) {
        console.error("크루 정보 조회 실패:", error);
        throw error;
    }
}

//크루 정보 수정하기
export const updateCrewAPI = async(id, updateData) =>{
  try {
    const response = await axios.put(`/api/crew-board/${id}`, updateData, {withCredentials: true});
    return response.data
  }
  catch (error){
    console.error("크루정보 수정 실패", error);
    throw error;
  }
}

//크루 삭제하기
export const deleteCrewAPI = async (crewId) => {
    try {   
        const response = await axios.delete(`/api/crew-board/${crewId}`, {withCredentials: true}) 
        return response.data;
    } catch (error) {
        console.error("크루 삭제 실패:", error);
        throw error;
    }   
}