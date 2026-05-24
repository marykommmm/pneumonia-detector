import React, { useState } from "react";
import axios from "axios";
import "../styles/AuthPage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const response = await axios.post(`${API_BASE}/api/auth/login`, {
          email: formData.email,
          password: formData.password,
        });

        onLoginSuccess({
          id: response.data.user_id || response.data.id,
          username: response.data.username,
          role: response.data.role,
        });
      } else {
        const response = await axios.post(`${API_BASE}/api/auth/register`, {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        onLoginSuccess({
          id: response.data.id,
          username: response.data.username,
          role: response.data.role,
        });
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Помилка з'єднання з сервером");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
          {isLogin ? "З поверненням" : "Створення акаунту"}
        </h2>
        <p className="auth-subtitle">
          {isLogin
            ? "Увійдіть до системи LungAI"
            : "Зареєструйтеся, щоб почати тренування"}
        </p>

        {error && <div className="auth-error-alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Ім'я користувача (ПІБ)</label>
              <input
                type="text"
                name="username"
                required={!isLogin}
                value={formData.username}
                onChange={handleChange}
                placeholder="Іван Петренко"
              />
            </div>
          )}

          <div className="input-group">
            <label>Email адреса</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@hospital.ua"
            />
          </div>

          <div className="input-group">
            <label>Пароль</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Зачекайте..." : isLogin ? "Увійти" : "Зареєструватися"}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? "Немає акаунту?" : "Вже є акаунт?"}
          <button
            type="button"
            className="switch-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
          >
            {isLogin ? "Зареєструватися" : "Увійти"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
