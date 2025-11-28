import axios from "axios";

const API_BASE = "/api/crew-board";

export const crewCreateAPI = async (data) => {
    return axios.post(API_BASE, data, {withCredentials: true});
}