import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "../styles/SettingsPage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function SettingsPage({ user, onLogout, onUpdateUser }) {
  const { i18n, t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Тема оформлення (за замовчуванням light)
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    role: user?.role || "student",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Зникаюче сповіщення
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  // Застосування теми
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (newTheme) => {
    if (newTheme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("app_language", lang);
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Миттєво застосовуємо, щоб користувач бачив результат
    if (newTheme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE}/api/auth/update-profile`, {
        user_id: user.id,
        username: formData.username,
        email: formData.email,
        role: formData.role,
      });
      onUpdateUser(response.data);
      setMessage({ type: "success", text: t("settings.msg_profile_success") });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || t("settings.msg_profile_error"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: t("settings.msg_pwd_mismatch") });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/change-password`, {
        user_id: user.id,
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      setMessage({ type: "success", text: t("settings.msg_pwd_success") });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || t("settings.msg_pwd_error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      {/* Тост-сповіщення */}
      {message.text && (
        <div className={`status-toast ${message.type}`}>
          {message.type === "success" ? "✓" : "⚠"} {message.text}
        </div>
      )}

      {/* ШАПКА */}
      <div className="settings-header-top">
        <div className="header-text">
          <h1>{t("settings.title")}</h1>
          <p>{t("settings.subtitle")}</p>
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
                  ? t("settings.role_admin")
                  : t("settings.role_student")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* СІТКА 2 КОЛОНКИ */}
      <div className="settings-grid-main">
        {/* ЛІВА КОЛОНКА */}
        <div className="settings-col">
          <form className="theme-card form-card" onSubmit={handleProfileSubmit}>
            <h3>
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="icon-heading"
                style={{
                  width: "24px",
                  height: "24px",
                  marginRight: "8px",
                  verticalAlign: "text-bottom",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              {t("settings.account_title")}
            </h3>

            <div className="form-group">
              <label>{t("settings.fullname_label")}</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="theme-input"
                required
              />
            </div>

            <div className="form-group">
              <label>{t("settings.email_label")}</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="theme-input"
                  required
                />
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  className="text-success verified-icon"
                  style={{
                    width: "20px",
                    height: "20px",
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="form-group">
              <label>{t("settings.role_label")}</label>
              <input
                type="text"
                value={
                  user?.role === "admin"
                    ? t("settings.role_admin")
                    : t("settings.role_student")
                }
                className="theme-input disabled-input"
                disabled
              />
              <p className="hint-text">{t("settings.role_hint")}</p>
            </div>

            <button
              type="submit"
              className="btn-primary-block mt-2"
              disabled={loading}
            >
              {loading ? t("settings.saving") : t("settings.save_changes")}
            </button>
          </form>

          <div className="theme-card form-card mt-3">
            <h3>
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="icon-heading"
                style={{
                  width: "24px",
                  height: "24px",
                  marginRight: "8px",
                  verticalAlign: "text-bottom",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                />
              </svg>
              {t("settings.system_title")}
            </h3>

            <div className="form-group">
              <label>{t("settings.language_label")}</label>
              <select
                className="theme-input theme-select"
                value={i18n.language}
                onChange={handleLanguageChange}
              >
                <option value="uk">Українська (UK)</option>
                <option value="en">English (EN)</option>
              </select>
            </div>

            <div className="form-group mb-0">
              <label>{t("settings.theme_label")}</label>
              <select
                className="theme-input theme-select"
                value={theme}
                onChange={handleThemeChange}
              >
                <option value="light">{t("settings.theme_light")}</option>
                <option value="dark">{t("settings.theme_dark")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* ПРАВА КОЛОНКА */}
        <div className="settings-col">
          <form
            className="theme-card form-card"
            onSubmit={handlePasswordSubmit}
          >
            <h3>
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="icon-heading"
                style={{
                  width: "24px",
                  height: "24px",
                  marginRight: "8px",
                  verticalAlign: "text-bottom",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              {t("settings.password_title")}
            </h3>

            <div className="form-group">
              <label>{t("settings.current_password")}</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="•••••••••"
                className="theme-input"
                required
              />
            </div>

            <div className="form-group">
              <label>{t("settings.new_password")}</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="•••••••••"
                className="theme-input"
                required
              />
            </div>

            <div className="form-group">
              <label>{t("settings.confirm_password")}</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="•••••••••"
                className="theme-input"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-outline-block mt-2"
              disabled={loading}
            >
              {t("settings.change_password_btn")}
            </button>
          </form>

          <div className="theme-card danger-card mt-3">
            <h3 className="danger-title">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="icon-heading"
                style={{
                  width: "24px",
                  height: "24px",
                  marginRight: "8px",
                  verticalAlign: "text-bottom",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {t("settings.danger_zone_title")}
            </h3>

            <div className="danger-action-row">
              <div>
                <h4>{t("settings.logout_title")}</h4>
                <p>{t("settings.logout_desc")}</p>
              </div>
              <button
                type="button"
                className="btn-outline-block compact"
                onClick={onLogout}
              >
                {t("settings.logout_btn")}
              </button>
            </div>

            <div className="danger-separator"></div>

            <div className="danger-action-row">
              <div>
                <h4 className="text-danger">
                  {t("settings.delete_account_title")}
                </h4>
                <p>{t("settings.delete_account_desc")}</p>
              </div>
              <button type="button" className="btn-danger-outline compact">
                {t("settings.delete_btn")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
