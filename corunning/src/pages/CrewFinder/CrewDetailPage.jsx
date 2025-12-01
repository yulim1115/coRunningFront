import { getCrewDetailAPI, applyCrewAPI } from "../../api/crewApi.js";
import React, { useState, useEffect } from "react";
import "./CrewPage.css";
import { useParams,  useNavigate } from "react-router-dom";

function CrewDetailPage() {
    const { id } = useParams();       
    const [crewDetail, setCrewDetail] = useState(null);
    const navigate = useNavigate();

    useEffect(() => { 
        const fetchCrewDetail = async () => {  
            try {
                const data = await getCrewDetailAPI(id); 
                setCrewDetail(data);
            } catch (error) {
                console.error("크루 상세 정보 불러오기 실패:", error);
            }}
            fetchCrewDetail();
    }, [id]);

    // 모집 상태 필터
    const recruitState = (recruitCount, currentCount, deadline) => {
        if (currentCount >= recruitCount || new Date(deadline) < new Date()) {
            return "모집마감";
        } else {
            return "모집중";
        }
    };

    // 크루 신청하기
    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await applyCrewAPI(id); 
            alert("크루 신청이 완료되었습니다.");
        } catch (error) {
            console.error("크루 신청 실패:", error);
            alert("크루 신청에 실패했습니다.");
        }
    }

    if (!crewDetail) {
        return <div>로딩 중...</div>;
    }
    return (<div>
        <div className="detail-page-wrapper">
            <div className="container post-container-inner">
                <a href="#" className="back-link-top">
                    <i className="fas fa-arrow-left" onClick={() => navigate("/crews")}></i> 목록으로 돌아가기
                </a>
                <div className="route-title-area">
                    <div className="title-meta-wrapper">
                        <div className="title-group">
                            <h1 style={{fontSize: "32px;"}}>{crewDetail.title}</h1>
                        </div>
                        <div className="meta-info-block">
                            <span><i className="fas fa-user"></i> 작성자: {crewDetail.writerId}</span>
                            <span><i className="fas fa-clock"></i>{crewDetail.createdAt.substr(0,10)}등록</span>
                        </div>
                    </div>
                    <div className="application-action-group">
                        <button className="standard-button btn-main-action" onClick={handleApply}>
                            <i className="fas fa-running" style={{marginRight: "5px;"}}></i> 크루 신청하기
                        </button>
                    </div>
                </div>

                <div className="route-content">
                    <div className="image-section">
                        <div className="map-visual-area">
                            {/*<img src="https://via.placeholder.com/800x450?text=CREW+RUNNING+ROUTE+MAP" alt="크루 모집 경로 지도">*/}
                        </div>
                    </div>
                    <div className="actions-section">
                        <div className="recruitment-info-box">
                            <h2>크루 모집 정보</h2>
                            <div className="info-detail-group">
                                <p><strong>모집 상태:</strong>
                                    <span className="status-highlight">
                                        &nbsp;{recruitState(crewDetail.recruitCount, crewDetail.currentCount, crewDetail.deadline)}
                                    </span>
                                </p>
                                <p><strong>모집 인원:</strong>
                                    <span className="status-highlight">{crewDetail.currentCount}명 / {crewDetail.recruitCount}명</span>
                                </p>
                            </div>
                            <div className="info-detail-group">
                                <p><strong>활동 지역:</strong> {crewDetail.region}</p>
                                <p><strong>활동 타입:</strong> {crewDetail.boardType}</p>
                            </div>
                            <div className="info-detail-group" style={{marginBottom: "0;"}}>
                                <p><strong>마감일:</strong> {crewDetail.deadline}</p>
                            </div>
                        </div>
                        <div className="apply-action-box" style={{marginBottom: "0;"}}>
                            <p>신청 완료 후 크루장에게 전달되며, 크루장이 개별적으로 연락드립니다.</p>
                            <p className="extra-small">모집 인원이 모두 차거나 마감일이 지나면 신청이 자동으로 마감됩니다.</p>
                        </div>
                    </div>
                </div>


                <div className="post-body">
                    <h2 style={{fontSize: "20px;"}}>{crewDetail.content}</h2>
                </div>


                <section className="comments-section">
                    <div className="comments-header">
                        <h2>댓글 (3개)</h2>
                    </div>
                    <div className="comment-input-area">
                        <input type="text" placeholder="크루 활동에 대한 문의를 남겨주세요." />
                        <button className="submit-btn">등록</button>
                    </div>
                    <div className="comment-list">
                        <div className="comment-item">
                            <div className="comment-avatar">H</div>
                            <div className="comment-content-area">
                                <div className="comment-author-info">
                                    <strong>황덕배</strong>
                                    <span className="date">2025.12.01</span>
                                </div>
                                <p className="comment-text">활동 요일 변경 계획은 없으신가요? 금요일은 참여가 어려워서요 😭</p>
                            </div>
                        </div>
                        <div className="comment-item">
                            <div className="comment-avatar">C</div>
                            <div className="comment-content-area">
                                <div className="comment-author-info">
                                    <strong>크루리더A</strong>
                                    <span className="date">2025.12.02</span>
                                </div>
                                <p className="comment-text">현재는 금요일 고정입니다. 죄송해요! 다음에 더 많은 요일 옵션을 고려해볼게요.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <a href="#" className="back-to-list-btn">
                    <i className="fas fa-list-ul" style={{marginRight: "5px;"}}></i> 크루 모집 목록으로 돌아가기
                 </a>

            </div>
        </div>
    </div>);}

export default CrewDetailPage;