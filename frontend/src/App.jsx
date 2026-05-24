import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import "./App.css";
import Navigation from "./components/Navigation";
import ScrollToTop from "./components/ScrollToTop"; // <-- 1. ДОДАЛИ ІМПОРТ ПOМІЧНИКА
import Home from "./pages/Home";
import DiagnosisPage from "./pages/DiagnosisPage";
import TrainingPage from "./pages/TrainingPage";
import AdminDashboard from "./components/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Перевіряємо тему
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
    }

    // Перевірка авторизації
    const savedUser = localStorage.getItem("user");
    const savedStatus = localStorage.getItem("isLoggedIn");

    if (savedStatus === "true" && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    // 1. Очищаємо дані користувача
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("user");

    // 2. Очищаємо тему (опціонально, якщо хочете повне скидання)
    localStorage.removeItem("theme");

    // 3. ПЕРЕНАПРАВЛЯЄМО НА ГОЛОВНУ через перезавантаження, щоб уникнути помилок роутера
    window.location.href = "/";
  };

  const handleUpdateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <I18nextProvider i18n={i18n}>
        <Router>
          <ScrollToTop /> {/* <-- 2. ВСТАВИЛИ СЮДИ ВСЕРЕДИНУ РОУТЕРА */}
          <div className="app-container">
            {/* Показуємо бокову навігацію тільки якщо це НЕ адмін */}
            {user?.role !== "admin" && (
              <Navigation
                isLoggedIn={isLoggedIn}
                user={user}
                onLogout={handleLogout}
                onLogin={handleLogin}
              />
            )}

            <main
              className={user?.role === "admin" ? "admin-main" : "main-content"}
            >
              <Routes>
                {/* Якщо залогінився адмін — показуємо йому ТІЛЬКИ адмінку */}
                {isLoggedIn && user?.role === "admin" ? (
                  <Route
                    path="*"
                    element={<AdminDashboard onLogout={handleLogout} />}
                  />
                ) : (
                  <>
                    <Route
                      path="/"
                      element={
                        <Home isLoggedIn={isLoggedIn} onLogin={handleLogin} />
                      }
                    />

                    {/* ОСНОВНІ ІНСТРУМЕНТИ */}
                    <Route
                      path="/diagnosis"
                      element={
                        isLoggedIn ? (
                          <DiagnosisPage userId={user?.id} />
                        ) : (
                          <Home isLoggedIn={false} onLogin={handleLogin} />
                        )
                      }
                    />
                    <Route
                      path="/training"
                      element={
                        isLoggedIn ? (
                          <TrainingPage userId={user?.id} />
                        ) : (
                          <Home isLoggedIn={false} onLogin={handleLogin} />
                        )
                      }
                    />

                    {/* СТОРІНКИ КАБІНЕТУ (НОВІ) */}
                    <Route
                      path="/profile"
                      element={
                        isLoggedIn ? (
                          <ProfilePage user={user} />
                        ) : (
                          <Home isLoggedIn={false} onLogin={handleLogin} />
                        )
                      }
                    />
                    <Route
                      path="/history"
                      element={
                        isLoggedIn ? (
                          <HistoryPage user={user} />
                        ) : (
                          <Home isLoggedIn={false} onLogin={handleLogin} />
                        )
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        isLoggedIn ? (
                          <SettingsPage
                            user={user}
                            onLogout={handleLogout}
                            onUpdateUser={handleUpdateUser}
                          />
                        ) : (
                          <Home isLoggedIn={false} onLogin={handleLogin} />
                        )
                      }
                    />
                  </>
                )}
              </Routes>
            </main>
          </div>
        </Router>
      </I18nextProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
