import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

function Login() {
    const [id,setId] = useState("");
    const [pw,setPw] = useState("");

    const navigate = useNavigate();

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">로그인</h2>

                <div className="form-row">
                    <label className="form-label center-label">ID</label>
                    <div className="form-right">
                        <input 
                            type="text" 
                            className="auth-input" 
                            placeholder="아이디를 입력하세요" 
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                        />
                    </div>
                </div>
                
                
                <div className="form-row">
                    <label className="form-label center-label">PW</label>
                    <div className="form-right">
                        <input 
                            type="password" 
                            className="auth-input" 
                            placeholder="비밀번호를 입력하세요" 
                            value={pw}
                            onChange={(e) => setPw(e.target.value)}
                        />
                    </div>
                </div>
                
                

                <button className="auth-button">Sign in</button>

                {/* 계정 찾는 곳 - 우측 정렬 */}
                <div className="find-link-right">
                    아이디 / 비밀번호 찾기
                </div>

                <div className="signup-center">
                    계정이 없나요? <span className="go-signup" onClick={() => navigate("/signup")}>회원가입</span>
                </div>
            </div>
        </div>
    );
}

export default Login;