// AccountEdit.jsx
import React from "react";
import DaumPostcode from "react-daum-postcode";

export default function AccountEdit({
  userData,
  userName,
  phone,
  userAddress,
  setUserName,
  setPhone,
  setUserAddress,
  detailAddress,
  setDetailAddress,
  openPostcode,
  setOpenPostcode,
  updateProfile,
}) {
  return (
    <div id="account" className="content-block active">
      <div className="accountedit-title-group">
        <h1>프로필 / 계정 정보 수정</h1>
      </div>

      <h3 className="form-section-title">회원 정보</h3>

      <form method="post" className="accountedit-form">
        {/* 이름 */}
        <div className="form-group">
          <label className="form-label">
            이름 <span className="required">수정 불가</span>
          </label>
          <input
            type="text"
            value={userName}
            disabled
          />
        </div>

        {/* 생년월일 */}
        <div className="form-group">
          <label className="form-label">
            생년월일 <span>수정 불가</span>
          </label>
          <input type="text" value={userData.birthDate} disabled />
        </div>

        {/* 이메일 */}
        <div className="form-group">
          <label className="form-label">
            이메일 (ID) <span>수정 불가</span>
          </label>
          <input type="email" value={userData.userId} disabled />
        </div>

        {/* 연락처 */}
        {/* <h3 className="form-section-title">연락처 및 주소 수정</h3> */}

        <div className="form-group">
          <label className="form-label">연락처</label>
          <input
            type="text"
            placeholder="010-XXXX-XXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* 주소 영역 */}
        <div className="address-group">
          {/* 우편번호 + 검색 */}
          <div className="form-group">
            <label className="form-label">
              주소 <span className="required">*</span>
            </label>

            <div className="flex-row">
              <input
                type="text"
                placeholder="우편번호"
                value={userAddress}
                disabled
              />
              <button
                type="button"
                className="btn btn-accent btn-large"
                onClick={() => setOpenPostcode(true)}
              >
                주소 검색
              </button>
            </div>
          </div>

          {/* 상세주소 */}
          <div className="form-group">
            <input
              type="text"
              placeholder="상세 주소 (선택)"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
            />
          </div>
        </div>

        {/* 주소 모달 */}
        {openPostcode && (
          <div className="postcode-modal-overlay">
            <div className="postcode-modal">
              <DaumPostcode
                autoClose
                onComplete={(data) => {
                  setUserAddress(`${data.address}`.trim());
                  setOpenPostcode(false);
                }}
              />
              <button
                className="btn btn-secondary btn-small"
                onClick={() => setOpenPostcode(false)}
                style={{ marginTop: "10px" }}
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="action-buttons">
          <button
            type="submit"
            className="btn btn-main btn-large account-btn"
            onClick={updateProfile}
          >
            수정 완료
          </button>
          <button
            type="button"
            className="btn btn-soft btn-large account-btn"
            onClick={() => {
              setUserName(userData.userName ?? "");
              setPhone(userData.phone ?? "");
              setUserAddress(userData.userAddress ?? "");
            }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
