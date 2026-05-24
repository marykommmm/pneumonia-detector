import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import SettingsPanel from "../components/SettingsPanel";
import "../styles/Dashboard.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function Dashboard({ user }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalTrainings: 0,
    averageScore: 0,
    successRate: 0,
    bestScore: 0,
  });

  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedResult, setSelectedResult] = useState(null); // НОВИЙ СТЕЙТ ДЛЯ ДЕТАЛЕЙ
  const [showFullHistory, setShowFullHistory] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadStats();
    } else {
      setLoading(false);
      setError(
        t("dashboard.error_not_logged_in") || "Користувач не залогінений",
      );
    }
  }, [user, t]);

  const ResultCanvas = ({ imageUrl, userBoxes, gtBoxes }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      img.onload = () => {
        // Робимо канвас пропорційним до картинки
        const displayWidth = canvas.parentElement.clientWidth;
        const scale = displayWidth / img.naturalWidth;
        canvas.width = displayWidth;
        canvas.height = img.naturalHeight * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Малюємо еталон (Зелений)
        ctx.strokeStyle = "#00e676";
        ctx.lineWidth = 3;
        gtBoxes.forEach((box) => {
          ctx.strokeRect(
            box[0] * scale,
            box[1] * scale,
            (box[2] - box[0]) * scale,
            (box[3] - box[1]) * scale,
          );
        });

        // Малюємо студента (Червоний пунктир)
        ctx.strokeStyle = "#ff1744";
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        userBoxes.forEach((box) => {
          // Перевіряємо формат (об'єкт {x1, y1...} або масив [x1, y1...])
          const b = Array.isArray(box) ? box : [box.x1, box.y1, box.x2, box.y2];
          ctx.strokeRect(
            b[0] * scale,
            b[1] * scale,
            (b[2] - b[0]) * scale,
            (b[3] - b[1]) * scale,
          );
        });
      };
    }, [imageUrl, userBoxes, gtBoxes]);

    return (
      <canvas ref={canvasRef} style={{ width: "100%", borderRadius: "8px" }} />
    );
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/results/stats/${user.id}`,
      );

      setStats({
        totalTrainings: response.data.total_trainings || 0,
        averageScore: response.data.average_score || 0,
        successRate:
          response.data.average_score >= 70
            ? Math.round(response.data.average_score)
            : 50,
        bestScore: response.data.best_score || 0,
      });

      setRecentResults(response.data.recent_results || []);
    } catch (err) {
      console.error("Ошибка при загрузке статистики:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>{t("dashboard.loading") || "Завантажуюю..."}</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>{t("dashboard.error") || "Помилка"}</h1>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            {t("dashboard.retry") || "Спробувати ще раз"}
          </button>
        </div>
      </div>
    );
  }

  // --- РОЗУМНЕ ГРУПУВАННЯ РЕЗУЛЬТАТІВ ---
  const displayResults = [];
  let examBuffer = [];

  recentResults.forEach((res, index) => {
    // 1. Парсимо деталі
    let detailsObj = {};
    if (typeof res.details === "string") {
      try {
        detailsObj = JSON.parse(res.details);
      } catch (e) {}
    } else if (res.details) {
      detailsObj = res.details;
    }
    res.parsedDetails = detailsObj;

    // 2. Групуємо іспит
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
        // Якщо різниця в часі між знімками більше 5 хвилин — це різні іспити
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
        // Рахуємо середні значення для всього іспиту
        const avgScore =
          examBuffer.reduce((sum, r) => sum + r.score, 0) / examBuffer.length;
        const avgRel = (
          examBuffer.reduce(
            (sum, r) => sum + (r.parsedDetails.relative_error || 0),
            0,
          ) / examBuffer.length
        ).toFixed(1);
        const avgMse = (
          examBuffer.reduce(
            (sum, r) => sum + (r.parsedDetails.mse_error || 0),
            0,
          ) / examBuffer.length
        ).toFixed(4);

        // --- НОВА ЛОГІКА АНАЛІЗУ ПОМИЛОК ---
        const totalMissed = examBuffer.reduce(
          (sum, r) => sum + (r.parsedDetails.missed || 0),
          0,
        );
        const totalFalsePositives = examBuffer.reduce(
          (sum, r) => sum + (r.parsedDetails.false_positives || 0),
          0,
        );

        let recKey = "dashboard.recommendations.general"; // За замовчуванням

        if (avgScore >= 90) {
          recKey = "dashboard.recommendations.excellent";
        } else if (
          totalFalsePositives > totalMissed &&
          totalFalsePositives > 2
        ) {
          recKey = "dashboard.recommendations.overdiagnosis";
        } else if (totalMissed > totalFalsePositives && totalMissed > 2) {
          recKey = "dashboard.recommendations.underdiagnosis";
        } else if (avgRel > 35) {
          recKey = "dashboard.recommendations.precision";
        } else if (avgScore < 60) {
          recKey = "dashboard.recommendations.hard_practice";
        }

        displayResults.push({
          id: `exam_group_${res.id}`,
          is_group: true,
          session_mode: "exam",
          difficulty: "mixed",
          created_at: examBuffer[0].created_at,
          score: avgScore,
          parsedDetails: { relative_error: avgRel, mse_error: avgMse },
          recommendationKey: recKey, // ЗБЕРІГАЄМО КЛЮЧ
          items: [...examBuffer].reverse(),
        });
        examBuffer = [];
      }
    } else {
      // Практику додаємо як є
      displayResults.push(res);
    }
  });

  return (
    <div className="dashboard-modern">
      <div className="dashboard-header-simple">
        <h1>{t("dashboard.profile") || "Профіль"}</h1>
      </div>

      {!showFullHistory ? (
        <div className="profile-grid-3col">
          {/* PROFILE */}
          <div className="dash-card profile-card-modern">
            <div className="profile-user-header">
              <div className="avatar-large">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="user-titles">
                <h2>{user?.username}</h2>

                <span className="user-email">{user?.email}</span>
              </div>
            </div>

            <div className="profile-details-list">
              <h3>Особиста інформація</h3>

              <div className="detail-row">
                <span className="detail-label">ПІБ</span>
                <span className="detail-value">{user?.username}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Дата реєстрації</span>

                <span className="detail-value">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("uk-UA")
                    : "N/A"}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Пройдено сесій</span>

                <span className="detail-value text-blue">
                  {stats.totalTrainings}
                </span>
              </div>
            </div>
          </div>

          {/* HISTORY */}
          <div className="dash-card history-card-modern">
            <div className="card-header-flex">
              <h3>Історія аналізів</h3>

              {displayResults.length > 4 && (
                <button
                  className="btn-link"
                  onClick={() => setShowFullHistory(true)}
                >
                  Переглянути всі
                </button>
              )}
            </div>

            <div className="recent-history-list">
              {displayResults.length > 0 ? (
                displayResults.slice(0, 4).map((result, idx) => {
                  const dateStr = result.created_at.endsWith("Z")
                    ? result.created_at
                    : result.created_at + "Z";

                  const formattedDate = new Date(dateStr).toLocaleDateString(
                    "uk-UA",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  );

                  return (
                    <div
                      key={result.id || idx}
                      className="history-list-item"
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="history-item-icon">
                        <i
                          className={
                            result.is_group ? "gg-clipboard" : "gg-image"
                          }
                        ></i>
                      </div>

                      <div className="history-item-info">
                        <span className="history-item-title">
                          {result.is_group ? "Іспит" : "Аналіз"}
                        </span>

                        <span className="history-item-date">
                          {formattedDate}
                        </span>

                        <span className="history-item-score">
                          Бал: {result.score.toFixed(0)}%
                        </span>
                      </div>

                      <div className="history-item-status">
                        <span
                          className={`status-dot ${
                            result.score > 70 ? "good" : "bad"
                          }`}
                        ></span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted">Немає історії</p>
              )}
            </div>
          </div>

          {/* SETTINGS */}
          <div className="dash-card settings-card-modern">
            <h3>Налаштування</h3>

            <div className="settings-list-simple">
              <button className="settings-list-btn">Обліковий запис</button>

              <button className="settings-list-btn">Змінити пароль</button>

              <button className="settings-list-btn danger-text">
                Видалити акаунт
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="full-history-view">
          <button
            className="btn-outline-small mb-3"
            onClick={() => setShowFullHistory(false)}
          >
            Назад
          </button>

          <div className="dash-card">
            <h3 style={{ marginBottom: "20px" }}>Всі сесії</h3>

            <div className="modern-history-table">
              <div className="table-header">
                <div>Дата</div>
                <div>Тип</div>
                <div>Похибки</div>
                <div>Бал</div>
                <div>Дії</div>
              </div>

              {displayResults.map((result, idx) => {
                const dateStr = result.created_at.endsWith("Z")
                  ? result.created_at
                  : result.created_at + "Z";

                const formattedDate = new Date(dateStr).toLocaleDateString(
                  "uk-UA",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                );

                const relError =
                  result.parsedDetails?.relative_error !== undefined
                    ? `${result.parsedDetails.relative_error}%`
                    : "N/A";

                const mseError =
                  result.parsedDetails?.mse_error !== undefined
                    ? result.parsedDetails.mse_error
                    : "N/A";

                return (
                  <div key={result.id || idx} className="table-row">
                    <div className="date-cell">{formattedDate}</div>

                    <div className="badges-cell">
                      <span className="badge">
                        {result.is_group ? "Іспит" : "Практика"}
                      </span>
                    </div>

                    <div className="metrics-cell">
                      <div className="metric">Rel: {relError}</div>

                      <div className="metric">MSE: {mseError}</div>
                    </div>

                    <div className="score-cell">{result.score.toFixed(1)}%</div>

                    <div className="action-cell">
                      <button
                        className="btn-outline-small"
                        onClick={() => setSelectedResult(result)}
                      >
                        Огляд
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {selectedResult && (
        <div className="modal-overlay" onClick={() => setSelectedResult(null)}>
          {/* ВСТАВ СЮДИ СВІЙ СТАРИЙ КОД MODAL */}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
