// App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Global Styles
import "./styles/Global.css";
import "mapbox-gl/dist/mapbox-gl.css";
import ScrollToTop from "./components/ScrollToTop";

// Layout
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Pages
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";

// Feature Pages
import RunRoutesListPage from "./pages/RunRoutes/RunRoutesListPage";
import RunRoutesDetailPage from "./pages/RunRoutes/RunRoutesDetailPage";
import RunRoutesCreatePage from "./pages/RunRoutes/RunRoutesCreatePage";

// import CrewListPage from "./pages/CrewFinder/CrewListPage";
// import CrewDetailPage from "./pages/CrewFinder/CrewDetailPage";
// import CrewCreatePage from "./pages/CrewFinder/CrewCreatePage";

// import RunLogPage from "./pages/RunLog/RunLogPage";
// import CrewListPage from "./pages/CrewFinder/CrewListPage";
// import CrewDetailPage from "./pages/CrewFinder/CrewDetailPage";
// import CrewCreatePage from "./pages/CrewFinder/CrewCreatePage";

import RunLogPage from "./pages/RunLog/RunLogPage";
import MyPage from "./pages/MyPage/MyPage";

function App() {
    return (
       <div className="page-container">
            <Router>
            <ScrollToTop />
                {/* 공통 Header */}
                <Header />
    
                {/* Page Routing */}
                <Routes>
                    {/* 메인 */}
                    <Route path="/" element={<HomePage />} />
    
                    {/* 인증 */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
    
                    {/* Run Routes */}
                    <Route path="/routes" element={<RunRoutesListPage />} />
                    <Route path="/routes/:id" element={<RunRoutesDetailPage />} />
                    <Route path="/routes/create" element={<RunRoutesCreatePage />} />
    
                    {/* Crew Finder */}
                    <Route path="/crews" element={<CrewListPage />} />
                    <Route path="/crews/:id" element={<CrewDetailPage />} />
                    <Route path="/crews/create" element={<CrewCreatePage />} />
    
                    {/* Run Log */}
                    {/* <Route path="/runlog" element={<RunLogPage />} /> */}
                    {/* <Route path="/crews" element={<CrewListPage />} /> */}
                    {/* <Route path="/crews/:id" element={<CrewDetailPage />} /> */}
                    {/* <Route path="/crews/create" element={<CrewCreatePage />} /> */}
    
                    {/* Run Log */}
                    <Route path="/runlog" element={<RunLogPage />} />
    
                    {/* My Page */}
                    <Route path="/mypage" element={<MyPage />} />
                </Routes>
    
                {/* 공통 Footer */}
                <Footer />
            </Router>
       </div>
    );
}

export default App;
