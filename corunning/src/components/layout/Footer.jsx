import logoImg from "../../assets/images/logo02.png";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* 상단 메뉴 영역 */}
        <div className="footer-top">

          {/* 로고 */}
          <div className="footer-logo">
           <img src={logoImg} alt="coRunning Logo" />            
          </div>

          {/* 메뉴 */}
          <div className="footer-links">
            <a href="/routes">Run Routes</a>
            <a href="/crews">Crew Finder</a>
            <a href="/runlog">Run Log</a>
            <a href="/mypage">My Page</a>
          </div>
        </div>

        {/* 하단 카피라이트 */}
        <div className="footer-bottom">
          © 2025 coRunning. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
}

export default Footer;
