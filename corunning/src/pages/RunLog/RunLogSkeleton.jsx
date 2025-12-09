function RunLogSkeleton() {
  // 가짜 아이템 개수
  const skeletonSaved = Array.from({ length: 1 });
  const skeletonRecords = Array.from({ length: 1 });

  return (
    <main className="runlog-container">
      <div className="runlog-wrapper">
        {/* 상단 제목 */}
        <section className="runlog-title-section">
          <h1 className="runlog-title">Run Log</h1>
        </section>

        {/* 저장한 코스 스켈레톤 */}
        <section className="section-box">
          <header className="title-section">
            <div className="skeleton skeleton-title"></div>
          </header>

          <div className="saved-list">
            {skeletonSaved.map((_, idx) => (
              <div key={idx} className="saved-item">
                {/* LogCard 자리 스켈레톤 */}
                <div className="skeleton-card">
                  <div className="skeleton skeleton-line short"></div>
                  <div className="skeleton skeleton-line"></div>
                  <div className="card-row">
                    <div className="skeleton skeleton-line tiny"></div>
                    <div className="skeleton skeleton-line tiny"></div>
                    <div className="skeleton skeleton-line tiny"></div>
                  </div>
                </div>

                {/* 펼쳐진 입력폼 스켈레톤 (1~2개 정도만 보이고 싶으면 조건부로 렌더링해도 됨) */}
                <div className="input-form-large skeleton-form">
                  <div className="skeleton skeleton-subtitle"></div>

                  <div className="runlog-inline-row">
                    <div className="form-row">
                      <div className="skeleton skeleton-label"></div>
                      <div className="skeleton skeleton-input-small"></div>
                    </div>

                    <div className="form-row">
                      <div className="skeleton skeleton-label"></div>
                      <div className="time-split-row">
                        <div className="skeleton skeleton-input-tiny"></div>
                        <span>:</span>
                        <div className="skeleton skeleton-input-tiny"></div>
                        <span>:</span>
                        <div className="skeleton skeleton-input-tiny"></div>
                      </div>
                    </div>

                    <div className="skeleton skeleton-button"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 완주 기록 스켈레톤 */}
        <section className="section-box">
          <header className="title-section">
            <div className="skeleton skeleton-title"></div>
          </header>

          <div className="record-list">
            {skeletonRecords.map((_, idx) => (
              <div key={idx} className="record-item">
                <div className="skeleton-card">
                  <div className="skeleton skeleton-line short"></div>
                  <div className="skeleton skeleton-line"></div>
                  <div className="card-row">
                    <div className="skeleton skeleton-line tiny"></div>
                    <div className="skeleton skeleton-line tiny"></div>
                    <div className="skeleton skeleton-line tiny"></div>
                  </div>
                </div>

                <div className="input-form-large skeleton-form">
                  <div className="skeleton skeleton-subtitle"></div>

                  <div className="runlog-inline-row">
                    <div className="form-row">
                      <div className="skeleton skeleton-label"></div>
                      <div className="skeleton skeleton-input-small"></div>
                    </div>

                    <div className="form-row">
                      <div className="skeleton skeleton-label"></div>
                      <div className="time-split-row">
                        <div className="skeleton skeleton-input-tiny"></div>
                        <span>:</span>
                        <div className="skeleton skeleton-input-tiny"></div>
                        <span>:</span>
                        <div className="skeleton skeleton-input-tiny"></div>
                      </div>
                    </div>

                    <div className="skeleton skeleton-button"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
export default RunLogSkeleton;