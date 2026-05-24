import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "../styles/HistoryPage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const AWS_S3_BASE_URL = import.meta.env.AWS_S3_BASE_URL;

const ResultSVGOverlay = ({ imageUrl, userBoxes, gtBoxes }) => {
  const [dims, setDims] = useState({
    width: 0,
    height: 0,
    naturalWidth: 1,
    naturalHeight: 1,
  });

  const handleImageLoad = (e) => {
    setDims({
      width: e.target.clientWidth,
      height: e.target.clientHeight,
      naturalWidth: e.target.naturalWidth || 1024,
      naturalHeight: e.target.naturalHeight || 1024,
    });
  };

  const scaleX = dims.width / dims.naturalWidth;
  const scaleY = dims.height / dims.naturalHeight;

  if (!imageUrl || imageUrl.includes("undefined")) {
    return (
      <div
        className="empty-img-placeholder"
        style={{
          width: "100%",
          height: "250px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-main)",
          borderRadius: "8px",
          border: "1px dashed var(--border-color)",
          marginTop: "15px",
          color: "var(--text-muted)",
        }}
      >
        Знімок недоступний
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        background: "#000",
        borderRadius: "8px",
        overflow: "hidden",
        width: "100%",
        display: "inline-block",
        marginTop: "15px",
      }}
    >
      <img
        src={imageUrl}
        alt="History Medical Scan"
        style={{ width: "100%", display: "block", height: "auto" }}
        onLoad={handleImageLoad}
      />

      {dims.width > 0 && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          {Array.isArray(gtBoxes) &&
            gtBoxes.map((box, bIdx) => {
              const x1 = (box[0] ?? box.x1) * scaleX;
              const y1 = (box[1] ?? box.y1) * scaleY;
              const x2 = (box[2] ?? box.x2) * scaleX;
              const y2 = (box[3] ?? box.y2) * scaleY;
              return (
                <rect
                  key={`gt-${bIdx}`}
                  x={x1}
                  y={y1}
                  width={Math.max(0, x2 - x1)}
                  height={Math.max(0, y2 - y1)}
                  fill="none"
                  stroke="#00e676"
                  strokeWidth="2.5"
                />
              );
            })}

          {Array.isArray(userBoxes) &&
            userBoxes.map((box, bIdx) => {
              const b = Array.isArray(box)
                ? box
                : [box.x1, box.y1, box.x2, box.y2];
              const x1 = b[0] * scaleX;
              const y1 = b[1] * scaleY;
              const x2 = b[2] * scaleX;
              const y2 = b[3] * scaleY;
              return (
                <rect
                  key={`user-${bIdx}`}
                  x={x1}
                  y={y1}
                  width={Math.max(0, x2 - x1)}
                  height={Math.max(0, y2 - y1)}
                  fill="none"
                  stroke="#ff1744"
                  strokeWidth="2.5"
                  strokeDasharray="5,4"
                />
              );
            })}
        </svg>
      )}
    </div>
  );
};

// ОСНОВНА СТОРІНКА ІСТОРІЇ
function HistoryPage({ user }) {
  const { t } = useTranslation();
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    if (user?.id) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/results/stats/${user.id}`,
      );
      setRecentResults(response.data.recent_results || []);
    } catch (err) {
      console.error(err);
    } finally {
      loading && setLoading(false);
    }
  };

  const safeParseBoxes = (boxesData) => {
    if (!boxesData) return [];
    if (Array.isArray(boxesData)) return boxesData;
    try {
      return JSON.parse(boxesData);
    } catch (e) {
      return [];
    }
  };

  const getClinicalVerdict = (res) => {
    const score = res.score || 0;
    const missed = res.parsedDetails?.missed || 0;
    const falsePos = res.parsedDetails?.false_positives || 0;

    if (score >= 85) {
      return (
        <span style={{ color: "#22c55e", fontWeight: "600" }}>
          {t("history.verdict_perfect", "Точний аналіз")}
        </span>
      );
    }
    if (missed > 0) {
      return (
        <span style={{ color: "#ef4444", fontWeight: "600" }}>
          {t("history.verdict_missed", "Пропущено патологію")} ({missed})
        </span>
      );
    }
    if (falsePos > 0) {
      return (
        <span style={{ color: "#f59e0b", fontWeight: "600" }}>
          {t("history.verdict_hyper", "Гіпердіагностика")}
        </span>
      );
    }
    return (
      <span style={{ color: "var(--text-muted)" }}>
        {t("history.verdict_satisfactory", "Задовільно")}
      </span>
    );
  };

  const displayResults = [];
  let examBuffer = [];

  recentResults.forEach((res, index) => {
    let detailsObj = {};
    if (typeof res.details === "string") {
      try {
        detailsObj = JSON.parse(res.details);
      } catch (e) {}
    } else if (res.details) {
      detailsObj = res.details;
    }
    res.parsedDetails = detailsObj;
    res.parsedStudentBoxes = safeParseBoxes(res.student_boxes);
    res.parsedGtBoxes = safeParseBoxes(res.ground_truth_boxes);

    if (res.session_mode === "exam") {
      examBuffer.push(res);
      const nextItem = recentResults[index + 1];
      let closeGroup = false;

      if (
        !nextItem ||
        nextItem.session_mode !== "exam" ||
        examBuffer.length === 15
      ) {
        closeGroup = true;
      } else {
        const t1 = new Date(
          res.created_at.endsWith("Z") ? res.created_at : res.created_at + "Z",
        );
        const t2 = new Date(
          nextItem.created_at.endsWith("Z")
            ? nextItem.created_at
            : nextItem.created_at + "Z",
        );
        if (Math.abs(t1 - t2) > 5 * 60 * 1000) closeGroup = true;
      }

      if (closeGroup) {
        const avgScore =
          examBuffer.reduce((sum, r) => sum + r.score, 0) / examBuffer.length;
        const totalMissed = examBuffer.reduce(
          (sum, r) => sum + (r.parsedDetails?.missed || 0),
          0,
        );
        const totalFalse = examBuffer.reduce(
          (sum, r) => sum + (r.parsedDetails?.false_positives || 0),
          0,
        );

        displayResults.push({
          id: `exam_group_${res.id}`,
          is_group: true,
          session_mode: "exam",
          difficulty: "mixed",
          created_at: examBuffer[0].created_at,
          score: avgScore,
          parsedDetails: { missed: totalMissed, false_positives: totalFalse },
          items: [...examBuffer].reverse(),
        });
        examBuffer = [];
      }
    } else {
      displayResults.push(res);
    }
  });

  if (loading)
    return (
      <div className="history-page">
        <div className="spinner-center">{t("history.loading")}</div>
      </div>
    );

  return (
    <div className="history-page">
      <div className="page-header">
        <h1>{t("history.title")}</h1>
        <p className="text-muted">{t("history.subtitle")}</p>
      </div>

      <div className="history-card-container">
        {displayResults.length > 0 ? (
          <div className="modern-history-table">
            <div className="table-header">
              <div>{t("history.table_date")}</div>
              <div>{t("history.table_type")}</div>
              <div>{t("history.table_verdict", "Вердикт аналізу")}</div>
              <div>{t("history.table_score")}</div>
              <div>{t("history.table_actions")}</div>
            </div>

            <div className="table-body">
              {displayResults.map((result, idx) => {
                // Безпечна перевірка: якщо дата є — форматуємо, якщо немає — ставимо прочерк
                let formattedDate = "—";

                if (result.created_at) {
                  const dateStr = result.created_at.endsWith("Z")
                    ? result.created_at
                    : result.created_at + "Z";

                  // УВАГА: тут тепер toLocaleString замість toLocaleDateString
                  formattedDate = new Date(dateStr).toLocaleString("uk-UA", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }

                return (
                  <div key={result.id || idx} className="table-row">
                    <div
                      className="date-cell"
                      style={{ fontWeight: "500", color: "var(--text-main)" }}
                    >
                      {formattedDate}
                    </div>

                    <div className="badges-cell">
                      <span
                        className={`badge mode-badge ${result.session_mode}`}
                      >
                        {result.is_group
                          ? t("history.mode_exam")
                          : t("history.mode_practice")}
                      </span>
                      {!result.is_group && (
                        <span
                          className={`badge diff-badge ${result.difficulty || "medium"}`}
                        >
                          {result.difficulty === "hard"
                            ? t("history.diff_hard")
                            : result.difficulty === "easy"
                              ? t("history.diff_easy")
                              : t("history.diff_medium")}
                        </span>
                      )}
                    </div>

                    <div className="metrics-cell" style={{ fontSize: "14px" }}>
                      {result.is_group ? (
                        result.score >= 85 ? (
                          <span style={{ color: "#22c55e", fontWeight: "600" }}>
                            {t("history.exam_success", "Успішний іспит")}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>
                            {t("history.exam_remarks", "Є зауваження")}
                          </span>
                        )
                      ) : (
                        getClinicalVerdict(result)
                      )}
                    </div>

                    <div
                      className={`score-cell ${result.score >= 80 ? "text-success" : result.score >= 50 ? "text-warning" : "text-danger"}`}
                    >
                      {result.score.toFixed(1)}%
                    </div>

                    <div className="action-cell">
                      <button
                        className="btn-outline-small"
                        onClick={() => setSelectedResult(result)}
                      >
                        {t("history.btn_review")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-history-state">
            <div className="empty-icon">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                style={{ width: "48px", height: "48px" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h3>{t("history.empty_title")}</h3>
            <p>{t("history.empty_desc")}</p>
          </div>
        )}
      </div>

      {selectedResult && (
        <div className="modal-overlay" onClick={() => setSelectedResult(null)}>
          <div
            className="modal-content result-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {selectedResult.is_group
                  ? t("history.modal_exam_title")
                  : t("history.modal_practice_title")}
              </h2>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedResult(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  color: "var(--text-muted)",
                }}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{ width: "24px", height: "24px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="modal-body scrollable">
              {selectedResult.is_group ? (
                <>
                  <div className="info-summary-card-grid">
                    <div className="info-block">
                      <label>{t("history.images_count")}</label>
                      <span>
                        {selectedResult.items.length} {t("history.images_pcs")}
                      </span>
                    </div>
                    <div className="info-block">
                      <label>{t("history.avg_score")}</label>
                      <span className="text-highlight">
                        {selectedResult.score.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <h3
                    className="section-title-small"
                    style={{ marginTop: "20px", marginBottom: "10px" }}
                  >
                    {t("history.review_images")}
                  </h3>
                  <div className="exam-accordion-list">
                    {selectedResult.items.map((item, i) => (
                      <details key={i} className="exam-details-item">
                        <summary>
                          <span className="summary-title">
                            {t("history.image_num", { num: i + 1 })}{" "}
                            <span className="diff-tag">
                              {item.difficulty === "hard"
                                ? t("history.diff_hard")
                                : item.difficulty === "easy"
                                  ? t("history.diff_easy")
                                  : t("history.diff_medium")}
                            </span>
                          </span>
                          <strong
                            className={
                              item.score > 70 ? "text-success" : "text-danger"
                            }
                          >
                            {item.score.toFixed(1)}%
                          </strong>
                        </summary>
                        <div className="summary-content">
                          <ResultSVGOverlay
                            imageUrl={item.imageUrl}
                            userBoxes={item.parsedStudentBoxes || []}
                            gtBoxes={item.parsedGtBoxes || []}
                          />
                        </div>
                      </details>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="practice-details-grid">
                    <div className="detail-box">
                      <label>{t("history.metric_iou")}</label>
                      <span>
                        {selectedResult.parsedDetails?.mean_iou
                          ? (
                              selectedResult.parsedDetails.mean_iou * 100
                            ).toFixed(1) + "%"
                          : "N/A"}
                      </span>
                    </div>
                    <div className="detail-box danger-box">
                      <label>{t("history.metric_missed")}</label>
                      <span>{selectedResult.parsedDetails?.missed || 0}</span>
                    </div>
                    <div className="detail-box warning-box">
                      <label>{t("history.metric_false")}</label>
                      <span>
                        {selectedResult.parsedDetails?.false_positives || 0}
                      </span>
                    </div>
                  </div>

                  <ResultSVGOverlay
                    imageUrl={selectedResult.imageUrl}
                    userBoxes={selectedResult.parsedStudentBoxes || []}
                    gtBoxes={selectedResult.parsedGtBoxes || []}
                  />

                  <div
                    className="final-score-banner"
                    style={{ marginTop: "20px" }}
                  >
                    {t("history.practice_score")}{" "}
                    <strong>{selectedResult.score.toFixed(1)}%</strong>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
