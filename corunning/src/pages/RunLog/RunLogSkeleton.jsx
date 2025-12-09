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
                  <div className="card-row">
                    <div className="skeleton skeleton-line tiny"></div>
                    <div className="skeleton skeleton-line tiny"></div>
                    <div className="skeleton skeleton-line tiny"></div>
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
                  <div className="card-row">
                    <div className="skeleton skeleton-line tiny"></div>
                    <div className="skeleton skeleton-line tiny"></div>
                    <div className="skeleton skeleton-line tiny"></div>
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