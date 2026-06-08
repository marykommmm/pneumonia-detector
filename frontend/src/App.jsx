import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import "./App.css";
import Navigation from "./components/Navigation";
import ScrollToTop from "./components/ScrollToTop";
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

  // ========================================================
  // 1. СТАРТОВИЙ EFFECT: Спрацьовує 1 раз при запуску додатка
  // ========================================================
  useEffect(() => {
    // Забороняємо браузеру автоматично відновлювати позицію прокрутки
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // Примусово скролимо вгору при першому старті
    window.scrollTo(0, 0);

    // Перевірка теми
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
  }, []); // 👈 Перший ефект тепер чітко закривається тут!

  // ========================================================
  // 2. РЕАКТИВНИЙ EFFECT: Скролить вгору ТОЧНО при логіні
  // ========================================================
  // 👑 ТОТАЛЬНЕ ОБНУЛЕННЯ СКРОЛУ ПРИ ЗМІНІ СТАТУСУ ЛОГІНУ
  useEffect(() => {
    if (isLoggedIn) {
      const resetAllScrolls = () => {
        // 1. Скролимо глобальне вікно та html/body
        window.scrollTo(0, 0);
        document.documentElement.scrollTo(0, 0);
        document.body.scrollTo(0, 0);

        // 2. Скролимо абсолютно всі потенційні CSS-контейнери додатка
        document.querySelector(".app-container")?.scrollTo(0, 0);
        document.querySelector(".main-content")?.scrollTo(0, 0);
        document.querySelector(".admin-main")?.scrollTo(0, 0);
      };

      // Запускаємо серією в кілька тактів, щоб перебити будь-яку інерцію браузера
      resetAllScrolls();
      requestAnimationFrame(resetAllScrolls);
      setTimeout(resetAllScrolls, 50);
      setTimeout(resetAllScrolls, 150);
    }
  }, [isLoggedIn]); // Спрацює чітко у мілісекунду зміни false -> true

  // ========================================================
  // 3. ФУНКЦІЇ ОБРОБКИ ПОДІЙ
  // ========================================================
  const handleLogin = (userData) => {
    console.log("handleLogin отримав:", userData);
    console.log("created_at у userData:", userData?.created_at);

    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("user");
    localStorage.removeItem("theme");
    window.location.href = "/";
  };

  const handleUpdateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  };

  // ========================================================
  // 4. ІНТЕРФЕЙС ДОДАТКА
  // ========================================================
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <I18nextProvider i18n={i18n}>
        <Router>
          <ScrollToTop />
          <div className="app-container">
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

                    {/* СТОРІНКИ КАБІНЕТУ */}
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
