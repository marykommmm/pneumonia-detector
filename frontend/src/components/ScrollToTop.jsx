import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Стандартне скидання (про всяк випадок для глобального вікна)
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);

    // 🎯 ГОЛОВНИЙ ФІКС ДЛЯ ТВОЄЇ СТРУКТУРИ:
    // Шукаємо твої контейнери з App.jsx і примусово скролимо їх до початку
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.scrollTo(0, 0);
    }

    const adminMain = document.querySelector(".admin-main");
    if (adminMain) {
      adminMain.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
