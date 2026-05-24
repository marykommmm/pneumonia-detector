import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "../styles/ProfilePage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function ProfilePage({ user }) {
  const { t } = useTranslation();

  const [stats, setStats] = useState({
    totalTrainings: 0,
    averageScore: 0,
    successRate: 0,
    bestScore: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const loadStats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/results/stats/${user.id}`,
      );

      const total = response.data.total_trainings || 0;
      const avg = response.data.average_score || 0;

      setStats({
        totalTrainings: total,
        averageScore: avg,
        successRate: total > 0 ? Math.round(avg) : 0,
        bestScore: response.data.best_score || 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="profile-page">
        <div className="loader">{t("dashboard.loading")}</div>
      </div>
    );

  if (error)
    return (
      <div className="profile-page">
        <div className="alert danger">{error}</div>
      </div>
    );

  // --- ЛОГІКА ДЛЯ РІВНЯ КОМПЕТЕНТНОСТІ ---
  const hasData = stats.totalTrainings > 0;

  const diagScore = hasData
    ? Math.min(100, Math.round(stats.averageScore + 2))
    : 0;
  const interpScore = hasData
    ? Math.max(0, Math.round(stats.averageScore - 5))
    : 0;
  const anomalyScore = hasData
    ? Math.min(100, Math.round(stats.averageScore + 9))
    : 0;
  const accuracyScore = hasData ? Math.round(stats.averageScore) : 0;

  let compLevel = t("dashboard.comp_no_data");
  let compColor = "var(--prof-muted)";
  let compText = t("dashboard.comp_no_data_desc");

  if (hasData) {
    if (stats.averageScore >= 80) {
      compLevel = t("dashboard.comp_high");
      compColor = "#10b981"; // Зелений
      compText = t("dashboard.comp_high_desc");
    } else if (stats.averageScore >= 50) {
      compLevel = t("dashboard.comp_medium");
      compColor = "#3b82f6"; // Синій
      compText = t("dashboard.comp_medium_desc");
    } else {
      compLevel = t("dashboard.comp_low");
      compColor = "#f59e0b"; // Жовтий
      compText = t("dashboard.comp_low_desc");
    }
  }

  const gaugePercent = hasData ? stats.averageScore : 0;
  const dashOffset = 125.6 - (125.6 * gaugePercent) / 100;

  return (
    <div className="profile-page">
      <div className="profile-header-top">
        <div className="header-text">
          <h1>{t("dashboard.profile")}</h1>
          <p>{t("dashboard.subtitle")}</p>
        </div>
        <div className="header-actions">
          <div className="user-mini-badge">
            <div className="mini-avatar">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="mini-info">
              <span className="name">{user?.username}</span>
              <span className="role">
                {user?.role === "admin"
                  ? t("dashboard.role_admin")
                  : t("dashboard.role_student")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid-main">
        {/* ЛІВА КОЛОНКА: ОСОБИСТА ІНФОРМАЦІЯ */}
        <div className="dark-card user-profile-card">
          <div className="avatar-huge-wrapper">
            <div className="avatar-huge">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>

          <h2 className="profile-name">{user?.username}</h2>
          <span className="profile-role">
            {user?.role === "admin"
              ? t("dashboard.role_admin")
              : t("dashboard.role_student")}
          </span>
          <span className="profile-badge">{t("dashboard.pro_account")}</span>

          <div className="profile-info-list mt-4">
            <div className="info-item">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{
                  width: "20px",
                  height: "20px",
                  color: "var(--prof-muted)",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.909A2.25 2.25 0 012.25 6.993V6.75m19.5 0v.243m0 0z"
                />
              </svg>
              <div>
                <label>Email</label>
                <span>{user?.email}</span>
              </div>
            </div>
            <div className="info-item">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{
                  width: "20px",
                  height: "20px",
                  color: "var(--prof-muted)",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              <div>
                <label>{t("dashboard.reg_date_label")}</label>
                <span>
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("uk-UA")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ПРАВА КОЛОНКА: СТАТИСТИКА ТА РІВЕНЬ */}
        <div className="right-column-content">
          <h3 className="section-subtitle">{t("dashboard.stats_title")}</h3>

          <div className="stats-grid-4col">
            <div className="dark-stat-card">
              <div className="stat-top">
                <span className="stat-label">
                  {t("dashboard.stat_total_sessions")}
                </span>
                <svg
                  className="stat-icon-small"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{ width: "22px", height: "22px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <div className="stat-bottom">
                <span className="stat-bignum">{stats.totalTrainings}</span>
                <div className="stat-sparkline chart-up"></div>
              </div>
            </div>

            <div className="dark-stat-card">
              <div className="stat-top">
                <span className="stat-label">
                  {t("dashboard.stat_avg_score")}
                </span>
                <svg
                  className="stat-icon-small"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{ width: "22px", height: "22px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M18.75 4.236c.982.143 1.954.317 2.916.52a6.003 6.003 0 01-5.395 4.972M10.5 2.25H13.5c.828 0 1.5.672 1.5 1.5v1.5c0 .828-.672 1.5-1.5 1.5H10.5c-.828 0-1.5-.672-1.5-1.5V3.75c0-.828.672-1.5 1.5-1.5z"
                  />
                </svg>
              </div>
              <div className="stat-bottom">
                <span className="stat-bignum">
                  {stats.averageScore.toFixed(0)}%
                </span>
                <div className="stat-sparkline chart-up"></div>
              </div>
            </div>

            <div className="dark-stat-card">
              <div className="stat-top">
                <span className="stat-label">
                  {t("dashboard.stat_success_rate")}
                </span>
                <svg
                  className="stat-icon-small"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{ width: "22px", height: "22px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <div className="stat-bottom">
                <span className="stat-bignum">{stats.successRate}%</span>
                <div className="stat-sparkline chart-down"></div>
              </div>
            </div>

            <div className="dark-stat-card">
              <div className="stat-top">
                <span className="stat-label">
                  {t("dashboard.stat_best_score")}
                </span>
                <svg
                  className="stat-icon-small"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{ width: "22px", height: "22px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="stat-bottom">
                <span className="stat-bignum">{stats.bestScore}%</span>
                <div className="stat-sparkline chart-up-green"></div>
              </div>
            </div>
          </div>

          {/* НОВИЙ БЛОК: РІВЕНЬ КОМПЕТЕНТНОСТІ */}
          <div className="dark-card competence-card mt-4">
            <h3
              className="section-subtitle mb-4"
              style={{ border: "none", padding: 0 }}
            >
              {t("dashboard.comp_title")}
            </h3>

            <div className="competence-grid">
              {/* Ліва частина: Графік-півколо */}
              <div className="gauge-section">
                <div className="gauge-container">
                  <svg viewBox="0 0 100 55" className="gauge-svg">
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="var(--prof-border)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      style={{ transition: "stroke 0.3s ease" }}
                    />
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="url(#blue-gradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray="125.6"
                      strokeDashoffset={dashOffset}
                      style={{ transition: "stroke-dashoffset 1s ease-out" }}
                    />
                    <defs>
                      <linearGradient
                        id="blue-gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="gauge-text">
                    <span className="level-title" style={{ color: compColor }}>
                      {compLevel}
                    </span>
                    <span className="level-sub">
                      {t("dashboard.comp_level_label")}
                    </span>
                  </div>
                </div>

                <p className="competence-desc">{compText}</p>
              </div>

              {/* Права частина: Смуги прогресу (Скіли) */}
              <div className="skills-section">
                <div className="skill-item">
                  <div className="skill-info">
                    <span className="skill-name">
                      {t("dashboard.skill_diag")}
                    </span>
                    <span className="skill-percent">{diagScore}%</span>
                  </div>
                  <div className="skill-bar-bg">
                    <div
                      className="skill-bar-fill"
                      style={{ width: `${diagScore}%`, background: "#3b82f6" }}
                    ></div>
                  </div>
                </div>

                <div className="skill-item">
                  <div className="skill-info">
                    <span className="skill-name">
                      {t("dashboard.skill_interp")}
                    </span>
                    <span className="skill-percent">{interpScore}%</span>
                  </div>
                  <div className="skill-bar-bg">
                    <div
                      className="skill-bar-fill"
                      style={{
                        width: `${interpScore}%`,
                        background: "#6366f1",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="skill-item">
                  <div className="skill-info">
                    <span className="skill-name">
                      {t("dashboard.skill_anomaly")}
                    </span>
                    <span className="skill-percent">{anomalyScore}%</span>
                  </div>
                  <div className="skill-bar-bg">
                    <div
                      className="skill-bar-fill"
                      style={{
                        width: `${anomalyScore}%`,
                        background: "#10b981",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="skill-item">
                  <div className="skill-info">
                    <span className="skill-name">
                      {t("dashboard.skill_accuracy")}
                    </span>
                    <span className="skill-percent">{accuracyScore}%</span>
                  </div>
                  <div className="skill-bar-bg">
                    <div
                      className="skill-bar-fill"
                      style={{
                        width: `${accuracyScore}%`,
                        background: "#3b82f6",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* НОВИЙ БЛОК: ПОРАДА ДНЯ */}
          <div className="dark-card tip-card mt-3">
            <div className="tip-icon">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{ width: "26px", height: "26px" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.829 1.508-2.336 1.145-.683 1.942-1.927 1.942-3.372 0-2.153-1.747-3.9-3.9-3.9s-3.9 1.747-3.9 3.9c0 1.445.797 2.689 1.942 3.372.85.507 1.508 1.353 1.508 2.336V18m0 0v-5.25"
                />
              </svg>
            </div>
            <div className="tip-content">
              <h4>{t("dashboard.tip_title")}</h4>
              <p>{t("dashboard.tip_desc")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
