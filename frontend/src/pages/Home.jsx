import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
// Імпортуємо локальні зображення
import lungsImg from "../../icons/3638644.jpg";
import heroXrayImg from "../../icons/lungs.png";
import "../styles/Home.css";
import lungsSvg from "../../icons/lungs-svgrepo-com.svg";

function Home({ isLoggedIn }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleStart = () => {
    if (isLoggedIn) {
      navigate("/diagnosis");
    } else {
      const loginBtn = document.querySelector(".btn-login");
      if (loginBtn) loginBtn.click();
    }
  };

  const handleTraining = () => {
    if (isLoggedIn) {
      navigate("/training");
    } else {
      const registerBtn = document.querySelector(".btn-register");
      if (registerBtn) registerBtn.click();
    }
  };

  const handleLearnMore = () => {
    // Шукаємо секцію з id="how" (це секція "Як це працює")
    const howSection = document.getElementById("how");
    if (howSection) {
      // Плавно прокручуємо до неї
      howSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home-landing">
      {/* --- HERO SECTION --- */}
      <section className="hero-section" id="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
              {t("home.ai_active", "AI для здорового майбутнього")}
            </div>

            <h1 className="hero-title">
              {t("home.hero_title_1", "Штучний інтелект")}
              <br />
              {t("home.hero_title_2", "для діагностики")}
              <br />
              <span className="text-gradient">
                {t("home.hero_title_highlight", "пневмонії")}
              </span>
            </h1>

            <p className="hero-description">
              {t(
                "home.hero_desc",
                "Інтерактивна платформа для навчання та самоперевірки з визначення пневмонії на рентгенівських знімках за допомогою штучного інтелекту.",
              )}
            </p>

            <div className="hero-buttons">
              <button className="btn-primary-large" onClick={handleStart}>
                {t("home.btn_diagnosis", "Почати тренування")}
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
              <button className="btn-secondary-large" onClick={handleLearnMore}>
                {t("home.btn_more", "Дізнатися більше")}
              </button>
            </div>

            <div className="hero-inline-features">
              <div className="inline-feature">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="inline-feature-text">
                  <strong>{t("home.feat_reliable", "Надійно")}</strong>
                  <p>
                    {t(
                      "home.feat_reliable_desc",
                      "AI-модель з високою точністю",
                    )}
                  </p>
                </div>
              </div>
              <div className="inline-feature">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3.042.526m15.084 6.094c.213-1.697.645-3.273 1.285-4.838M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="inline-feature-text">
                  <strong>{t("home.feat_educational", "Професійно")}</strong>
                  <p>
                    {t(
                      "home.feat_educational_desc",
                      "Інтерактивні кейси та зворотний зв'язок",
                    )}
                  </p>
                </div>
              </div>
              <div className="inline-feature">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                  />
                </svg>
                <div className="inline-feature-text">
                  <strong>{t("home.feat_effective", "Ефективно")}</strong>
                  <p>
                    {t(
                      "home.feat_effective_desc",
                      "Покращуйте свої навички щодня",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="xray-mockup">
              <img
                src={heroXrayImg}
                alt="X-ray detection"
                className="xray-image-bg"
              />
              <div className="yolo-box box-1"></div>
              <div className="yolo-box box-2"></div>

              <div className="analysis-card">
                <h4>{t("home.result_label", "Результат аналізу")}</h4>
                <div className="analysis-content">
                  <div className="analysis-percent">
                    <p>
                      {t("home.analysis_accuracy", "Ймовірність пневмонії")}
                    </p>
                    <span className="percent">87%</span>
                  </div>
                  <div className="progress-ring">
                    <svg viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="45" className="ring-bg" />
                      <circle
                        cx="60"
                        cy="60"
                        r="45"
                        className="ring-progress"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- INFO SECTION --- */}
      <section className="info-section">
        <div className="info-container">
          <div className="info-grid">
            {/* Left Card: Що таке пневмонія? */}
            <div className="info-card-large bg-lungs">
              <div className="lungs-top-section">
                <div className="lungs-illustration">
                  <img
                    src={lungsImg}
                    alt="Lungs Illustration"
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "16px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                    }}
                  />
                </div>
                <div className="lungs-text-content">
                  <h3>{t("home.info_about_title", "Що таке пневмонія?")}</h3>
                  <p>
                    {t(
                      "home.info_about_desc",
                      "Пневмонія — це інфекційне захворювання легень, яке викликає запалення легеневої тканини. Вчасна діагностика допомагає ефективно лікувати та запобігати ускладненням.",
                    )}
                  </p>
                </div>
              </div>

              {/* Блок з іконками внизу */}
              <div className="pneumonia-icons-wrapper">
                <div className="p-icon-item">
                  <div className="p-icon">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="10.5" cy="10.5" r="0.5" fill="currentColor" />
                      <circle cx="13.5" cy="13.5" r="0.5" fill="currentColor" />
                      <circle cx="12" cy="14" r="0.5" fill="currentColor" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v2m0 14v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M3 12h2m14 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
                      />
                    </svg>
                  </div>
                  <span>
                    {t("home.info_list_1", "Інфекція легеневої тканини")}
                  </span>
                </div>

                <div className="p-icon-item">
                  <div className="p-icon">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v7m0 0c-2.5-3-6-2.5-7 1-1 3.5.5 6 3 7.5 1.5.9 3 0 4-1.5m0-7c2.5-3 6-2.5 7 1 1 3.5-.5 6-3 7.5-1.5.9-3 0-4-1.5"
                      />
                    </svg>
                  </div>
                  <span>{t("home.info_list_2", "Ускладнює дихання")}</span>
                </div>

                <div className="p-icon-item">
                  <div className="p-icon">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0zM12 8v3"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 5h2m-2 4h2m-2 4h2"
                      />
                    </svg>
                  </div>
                  <span>
                    {t(
                      "home.info_list_3",
                      "Може супроводжуватися лихоманкою та кашлем",
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: Чому це важливо? */}
            <div className="info-card-large bg-white">
              <div className="info-card-content">
                <h3>{t("home.why_important_title", "Чому це важливо?")}</h3>
                <p>
                  {t(
                    "home.why_important_desc",
                    "Пневмонія є однією з найпоширеніших причин госпіталізації у світі. Швидка та точна діагностика значно підвищує шанси на одужання.",
                  )}
                </p>
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-icon">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        style={{ width: "28px", height: "28px" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                        />
                      </svg>
                    </div>
                    <div className="stat-number">450M+</div>
                    <p>
                      {t(
                        "home.stat_cases",
                        "випадків пневмонії щороку у світі",
                      )}
                    </p>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        style={{ width: "28px", height: "28px" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v4m-2-2h4"
                        />
                      </svg>
                    </div>
                    <div className="stat-number">~2.5M</div>
                    <p>
                      {t("home.stat_deaths", "смертей щороку через пневмонію")}
                    </p>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        style={{ width: "28px", height: "28px" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="stat-number">80%</div>
                    <p>
                      {t(
                        "home.stat_survival",
                        "випадків можна ефективно лікувати при ранньому виявленні",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section className="how-it-works-section" id="how">
        <div className="how-container">
          <h2>{t("home.how_it_works", "Як працює наша платформа?")}</h2>

          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-icon">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  style={{ width: "36px", height: "36px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  />
                </svg>
              </div>
              <h3>{t("home.step1_title", "Завантажте знімок")}</h3>
              <p>
                {t(
                  "home.step1_desc",
                  "Отримайте рентгенівський знімок грудної клітки для аналізу.",
                )}
              </p>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-icon">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  style={{ width: "36px", height: "36px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <h3>{t("home.step2_title", "AI аналізує")}</h3>
              <p>
                {t(
                  "home.step2_desc",
                  "Наша модель аналізує знімок та порівнює з вашою розміткою.",
                )}
              </p>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-icon">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  style={{ width: "36px", height: "36px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                  />
                </svg>
              </div>
              <h3>{t("home.step3_title", "Отримайте результат")}</h3>
              <p>
                {t(
                  "home.step3_desc",
                  "Дізнайтесь оцінку точності та рекомендації для покращення.",
                )}
              </p>
            </div>

            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-icon">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  style={{ width: "36px", height: "36px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M18.75 4.236c.982.143 1.954.317 2.916.52a6.003 6.003 0 01-5.395 4.972m0 0a5.006 5.006 0 005.105-5.105V3a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v1.251a5.006 5.006 0 005.105 5.105m0 0A7.498 7.498 0 0112 11.25c2.083 0 3.966-.845 5.318-2.213"
                  />
                </svg>
              </div>
              <h3>{t("home.step4_title", "Покращуйте навички")}</h3>
              <p>
                {t(
                  "home.step4_desc",
                  "Тренуйтесь на різних кейсах та відстежуйте свій прогрес.",
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US SECTION --- */}
      <section className="why-choose-section">
        <div className="why-choose-container">
          <h2>{t("home.why_choose_title", "Чому обирають LungAI?")}</h2>

          <div className="why-choose-layout">
            <div className="why-choose-list">
              <ul>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {t(
                    "home.benefit_1",
                    "Сучасні AI-моделі для аналізу рентгенівських знімків",
                  )}
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {t(
                    "home.benefit_2",
                    "Інтерактивне навчання з миттєвим зворотним зв'язком",
                  )}
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {t(
                    "home.benefit_3",
                    "Реальні медичні кейси та різні рівні складності",
                  )}
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {t(
                    "home.benefit_4",
                    "Детальна статистика та історія ваших результатів",
                  )}
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {t(
                    "home.benefit_5",
                    "Підходить для студентів, лікарів та медичних працівників",
                  )}
                </li>
              </ul>
            </div>

            <div className="target-card">
              <div className="target-icon">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  style={{ width: "40px", height: "40px" }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div>
                <h3>{t("home.target_title", "Наша мета")}</h3>
                <p>
                  {t(
                    "home.target_desc",
                    "Допомогти медичним працівникам та студентам опанувати навички інтерпретації рентгенівських знімків за допомогою штучного інтелекту та сучасних технологій.",
                  )}
                </p>
                {/* Змінено onClick з handleStart на handleTraining */}
                <button className="btn-primary-small" onClick={handleTraining}>
                  {t("home.btn_start_now", "Почати зараз")}
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- RISK FACTORS SECTION --- */}
      <section className="risk-factors-section">
        <div className="risk-container">
          <h2>{t("home.risk_title", "Фактори ризику розвитку пневмонії")}</h2>
          <p className="risk-subtitle">
            {t(
              "home.risk_subtitle",
              "Розуміння факторів ризику допомагає запобігти захворюванню та захистити своє здоров'я.",
            )}
          </p>

          <div className="risk-cards-grid">
            <div className="risk-card">
              <div className="risk-icon icon-green">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <h4>{t("home.risk_1_title", "Ослаблений імунітет")}</h4>
              <p>
                {t(
                  "home.risk_1_desc",
                  "Знижений імунітет підвищує ризик бактеріальних та вірусних інфекцій.",
                )}
              </p>
            </div>

            <div className="risk-card">
              <div className="risk-icon icon-orange">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
              </div>
              <h4>{t("home.risk_2_title", "Шкідливі звички")}</h4>
              <p>
                {t(
                  "home.risk_2_desc",
                  "Пошкоджують легеневу тканину та знижують захисні функції дихальної системи.",
                )}
              </p>
            </div>

            <div className="risk-card">
              <div className="risk-icon icon-red">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </div>
              <h4>{t("home.risk_3_title", "Хронічні захворювання")}</h4>
              <p>
                {t(
                  "home.risk_3_desc",
                  "ХОЗЛ, астма та серцеві патології можуть ускладнювати перебіг пневмонії.",
                )}
              </p>
            </div>

            <div className="risk-card">
              <div className="risk-icon icon-purple">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <h4>{t("home.risk_4_title", "Вікові групи ризику")}</h4>
              <p>
                {t(
                  "home.risk_4_desc",
                  "Діти та люди похилого віку мають вищу ймовірність ускладнень.",
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="cta-banner-section">
        <div className="cta-banner-container">
          <div className="cta-banner-content">
            <div className="cta-icon-target">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <div className="cta-text">
              <h2>
                {t(
                  "home.cta_title",
                  "Готові покращити свої навички діагностики?",
                )}
              </h2>
              <p>
                {t(
                  "home.cta_desc",
                  "Приєднуйтесь до лікарів, студентів та медичних працівників, які вже використовують LungAI для навчання та практики.",
                )}
              </p>
            </div>
          </div>
          <div className="cta-action">
            <button className="btn-primary-large" onClick={handleStart}>
              {t("home.btn_start_analysis", "Почати аналіз зараз")} &rarr;
            </button>
            <span className="cta-note">
              {t("home.cta_note", "Безкоштовно • Без реєстрації")}
            </span>
          </div>
        </div>
      </section>

      {/* --- NEW FOOTER --- */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <img
                  src={lungsSvg}
                  alt="LungAI Logo"
                  className="logo-icon-svg"
                  style={{
                    width: "36px",
                    height: "36px",
                    marginRight: "10px",
                    verticalAlign: "middle",
                  }}
                />
                <h2>LungAI</h2>
              </div>
              <p className="brand-desc">
                {t(
                  "home.footer_desc",
                  "AI-платформа для діагностики пневмонії та навчання на рентгенівських знімках.",
                )}
              </p>
            </div>

            <div className="footer-contact">
              <h4>{t("home.contact_us", "Зв'яжіться з нами")}</h4>
              <a href="mailto:info@lungai.com" className="contact-email">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  style={{ width: "18px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                info@lungai.com
              </a>
              <div className="social-links">
                <a href="#fb" className="social-icon">
                  f
                </a>
                <a href="#tg" className="social-icon">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.08-.18-.09-.05-.23-.02-.33 0-.14.03-2.34 1.48-6.61 4.36-.63.43-1.19.64-1.7.63-.55-.01-1.62-.31-2.41-.57-.97-.31-1.74-.48-1.68-1.02.03-.28.43-.57 1.2-.87 4.71-2.05 7.85-3.4 9.42-4.05 4.48-1.87 5.41-2.19 6.01-2.19.13 0 .43.03.59.16.14.12.18.28.19.43-.02.05-.02.13-.03.17z" />
                  </svg>
                </a>
                <a href="#yt" className="social-icon">
                  ▶
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="security-note">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {t(
                  "home.security_footer",
                  "Ваші дані захищені. Ми дотримуємось високих стандартів безпеки та конфіденційності.",
                )}
              </span>
            </div>
            <div className="copyright">
              © {new Date().getFullYear()} LungAI.{" "}
              {t("home.all_rights", "Усі права захищені.")}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
