import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // ← ДОДАНО useNavigate
import { useTranslation } from "react-i18next";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import "../styles/Navigation.css";
import lungsSvg from "../../icons/lungs-svgrepo-com.svg";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function Navigation({ isLoggedIn, user, onLogout, onLogin }) {
  const { t } = useTranslation();
  const navigate = useNavigate(); // ← ІНІЦІАЛІЗАЦІЯ ХУКУ НАВІГАЦІЇ

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const location = useLocation();

  useEffect(() => {
    const applyTheme = (themeName) => {
      if (themeName === "dark") {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
    };

    if (!isLoggedIn) {
      applyTheme("light");
    } else {
      const savedTheme = localStorage.getItem("theme") || "light";
      applyTheme(savedTheme);
    }
  }, [isLoggedIn]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isLoginMode) {
        response = await axios.post(`${API_BASE}/api/auth/login`, {
          email: formData.email,
          password: formData.password,
        });
      } else {
        response = await axios.post(`${API_BASE}/api/auth/register`, {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
      }

      const userData = {
        id: response.data.id || response.data.user_id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
        created_at: response.data.created_at,
      };

      onLogin(userData);
      setShowAuthModal(false);
      setFormData({ username: "", email: "", password: "" });

      // 🚀 ЗАВЖДИ ПЕРЕКИДАЄМО НА ГОЛОВНУ ПІСЛЯ ЗВИЧАЙНОГО ВХОДУ/РЕЄСТРАЦІЇ
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          t("auth.error_default", "Помилка при автентифікації"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/api/auth/google`, {
        token: credentialResponse.credential,
      });

      const userData = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
      };

      onLogin(userData);
      setShowAuthModal(false);

      // 🚀 ЗАВЖДИ ПЕРЕКИДАЄМО НА ГОЛОВНУ ПІСЛЯ ВХОДУ ЧЕРЕЗ GOOGLE
      navigate("/");
    } catch (err) {
      setError(t("auth.error_google", "Помилка входу через Google"));
    } finally {
      setLoading(false);
    }
  };

  const iconStyle = {
    width: "20px",
    height: "20px",
    marginRight: "10px",
    flexShrink: 0,
  };

  return (
    <>
      {/* 👑 АВТОРИЗОВАНИЙ РЕЖИМ: Показуємо бічний сайдбар */}
      {isLoggedIn ? (
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <img
                src={lungsSvg}
                alt="LungAI Logo"
                style={{ width: "32px", height: "32px", display: "block" }}
              />
            </div>
            <span>{t("nav.logo", "LungAI")}</span>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-group">
              <Link
                to="/"
                className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={iconStyle}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.592 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
                {t("nav.home", "Головна")}
              </Link>

              <Link
                to="/diagnosis"
                className={`nav-item ${location.pathname === "/diagnosis" ? "active" : ""}`}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={iconStyle}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                {t("nav.diagnosis", "Діагностика")}
              </Link>
              <Link
                to="/training"
                className={`nav-item ${location.pathname === "/training" ? "active" : ""}`}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={iconStyle}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t("nav.training", "Тренажер")}
              </Link>
            </div>

            <div className="nav-group-label">
              {t("nav.dashboard", "Кабінет")}
            </div>
            <div className="nav-group">
              <Link
                to="/profile"
                className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={iconStyle}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                {t("nav.profile", "Профіль")}
              </Link>
              <Link
                to="/history"
                className={`nav-item ${location.pathname === "/history" ? "active" : ""}`}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={iconStyle}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                {t("nav.history", "Історія")}
              </Link>
              <Link
                to="/settings"
                className={`nav-item ${location.pathname === "/settings" ? "active" : ""}`}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={iconStyle}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t("nav.settings", "Налаштування")}
              </Link>
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="user-profile-mini">
              <div className="user-info">
                <span className="user-name">{user?.username}</span>
                <span className="user-role">
                  {user?.role === "admin"
                    ? t("dashboard.role_admin", "Адміністратор")
                    : t("dashboard.role_student", "Студент")}
                </span>
              </div>
              <button className="logout-sidebar-btn" onClick={onLogout}>
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{ width: "16px", height: "16px", marginRight: "6px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                {t("nav.logout", "Вийти")}
              </button>
            </div>
          </div>
        </aside>
      ) : (
        /* 🌐 ГОСТЬОВИЙ РЕЖИМ: Верхня панель */
        <header
          className="header-guest"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "70px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid var(--border-color, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 40px",
            zIndex: 1000,
          }}
        >
          <div
            className="sidebar-logo"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <img
              src={lungsSvg}
              alt="LungAI Logo"
              style={{ width: "32px", height: "32px" }}
            />
            <span
              style={{
                fontWeight: "700",
                fontSize: "1.2rem",
                color: "#1e293b",
              }}
            >
              LungAI
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="btn-login"
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                background: "transparent",
                border: "1px solid #3b82f6",
                color: "#3b82f6",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => {
                setIsLoginMode(true);
                setShowAuthModal(true);
              }}
            >
              {t("auth.login_title", "Вхід")}
            </button>
            <button
              className="btn-register"
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                background: "#3b82f6",
                border: "none",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => {
                setIsLoginMode(false);
                setShowAuthModal(true);
              }}
            >
              {t("auth.register_title", "Реєстрація")}
            </button>
          </div>
        </header>
      )}

      {/* МОДАЛЬНЕ ВІКНО АВТОРИЗАЦІЇ */}
      {showAuthModal && (
        <div
          className="auth-modal-overlay"
          onClick={() => setShowAuthModal(false)}
        >
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-modal-btn"
              onClick={() => setShowAuthModal(false)}
              style={{
                background: "transparent",
                border: "none",
                position: "absolute",
                top: "15px",
                right: "15px",
                cursor: "pointer",
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
            <h2 style={{ marginBottom: "20px" }}>
              {isLoginMode
                ? t("auth.login_title", "Вхід")
                : t("auth.register_title", "Реєстрація")}
            </h2>

            {error && (
              <div
                className="auth-error"
                style={{
                  color: "#ef4444",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {!isLoginMode && (
                <input
                  type="text"
                  name="username"
                  placeholder={t("auth.name_placeholder", "Ім'я")}
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-input)",
                    color: "var(--text-main)",
                  }}
                />
              )}
              <input
                type="email"
                name="email"
                placeholder={t("auth.email_placeholder", "Email")}
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-input)",
                  color: "var(--text-main)",
                }}
              />
              <input
                type="password"
                name="password"
                placeholder={t("auth.password_placeholder", "Пароль")}
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-input)",
                  color: "var(--text-main)",
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ padding: "12px", marginTop: "10px" }}
              >
                {loading
                  ? t("auth.btn_loading", "Завантаження...")
                  : isLoginMode
                    ? t("auth.btn_login", "Увійти")
                    : t("auth.btn_register", "Зареєструватися")}
              </button>
            </form>

            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "20px",
                  color: "var(--text-muted)",
                  fontSize: "0.8rem",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--border-color)",
                  }}
                ></div>
                <span>{t("auth.or", "або")}</span>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--border-color)",
                  }}
                ></div>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setError(t("auth.error_google_failed", "Вхід скасовано"))
                  }
                  useOneTap
                  shape="pill"
                  theme={
                    document.body.classList.contains("dark-mode")
                      ? "filled_black"
                      : "outline"
                  }
                  width="100%"
                />
              </div>
            </div>

            <p
              className="auth-toggle-text"
              style={{ textAlign: "center", marginTop: "20px" }}
            >
              <button
                type="button"
                onClick={() => setIsLoginMode(!isLoginMode)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--primary-color, #3b82f6)",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {isLoginMode
                  ? t("auth.switch_to_register", "Реєстрація нового акаунта")
                  : t("auth.switch_to_login", "Вже є акаунт? Вхід")}
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default Navigation;
