// useAuth.js
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

export default function useAuth() {
    const [user, setUser] = useState(null);

    // 로그인 상태 확인
    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/api/users/me`, { withCredentials: true })
            .then((res) => setUser(res.data))
            .catch(() => setUser(null));
    }, []);

    // 로그아웃
    const logout = () => {
        axios.post(`${API_BASE_URL}/api/users/logout`, {}, { withCredentials: true })
            .then(() => {
                setUser(null);
                window.location.href = "/";
            });
    };

    return { user, logout };
}
