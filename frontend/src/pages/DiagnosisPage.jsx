import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "../styles/DiagnosisPage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function DiagnosisPage({ userId }) {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const currentStep = result ? 3 : loading ? 2 : 1;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(file);
      setError(null);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError(t("diagnosis.error_no_file") || "Будь ласка, виберіть файл");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const url = userId
        ? `${API_BASE}/api/results/diagnosis-with-image?user_id=${userId}`
        : `${API_BASE}/api/results/diagnosis-with-image`;

      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (err) {
      setError(
        t("diagnosis.error_api", { message: err.message }) ||
          `Помилка при аналізі: ${err.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const hasPneumonia = result?.has_pneumonia;

  // 2. Рамки показуємо ТІЛЬКИ якщо є пневмонія
  const showBoxes = hasPneumonia;

  const getRiskLevel = () => {
    // ВАЖЛИВО: Тепер ми дивимося ТІЛЬКИ на hasPneumonia, який прислав бекенд.
    // Навіть якщо рамок 0, але класифікатор дав >50% — це тривога!
    if (!hasPneumonia) {
      return {
        label: t("diagnosis.norm_label") || "Патологій не виявлено",
        color: "success",
        icon: (
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            style={{ width: "24px", height: "24px", marginRight: "8px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        title: t("diagnosis.norm_title") || "НОРМА",
      };
    }

    // Якщо hasPneumonia === true (незалежно від кількості рамок)
    return {
      color: "warning", // Це автоматично зробить відсоток червоним!
      icon: (
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          style={{ width: "24px", height: "24px", marginRight: "8px" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      title: t("diagnosis.pneumonia_title") || "ВИЯВЛЕНО ПАТОЛОГІЮ",
    };
  };

  const risk = getRiskLevel();

  const calcAreaPct = (box, imgWidth, imgHeight) => {
    const lungArea = imgWidth * 0.6 * imgHeight * 0.65;
    return ((((box.x2 - box.x1) * (box.y2 - box.y1)) / lungArea) * 100).toFixed(
      1,
    );
  };

  const calcTotalAreaPct = (boxes, imgWidth, imgHeight) => {
    const lungArea = imgWidth * 0.6 * imgHeight * 0.65;
    const total = boxes.reduce(
      (sum, box) => sum + (box.x2 - box.x1) * (box.y2 - box.y1),
      0,
    );
    return ((total / lungArea) * 100).toFixed(1);
  };

  const getSide = (box, imgWidth) => {
    const centerX = (box.x1 + box.x2) / 2;
    return centerX < imgWidth / 2
      ? t("diagnosis.right_lung") || "права легеня"
      : t("diagnosis.left_lung") || "ліва легеня";
  };

  return (
    <div className="diagnosis-page">
      <div className="page-header">
        <h1>{t("diagnosis.page_title") || "Діагностика пневмонії"}</h1>
      </div>

      {/* ПРОГРЕС-БАР (STEPPER) */}
      <div className="stepper-container">
        <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
          <div className="step-circle">1</div>
          <span>{t("diagnosis.step_upload") || "Завантаження"}</span>
        </div>
        <div className={`step-line ${currentStep >= 2 ? "active" : ""}`}></div>

        <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
          <div className="step-circle">2</div>
          <span>{t("diagnosis.step_analyze") || "Аналіз"}</span>
        </div>
        <div className={`step-line ${currentStep >= 3 ? "active" : ""}`}></div>

        <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
          <div className="step-circle">3</div>
          <span>{t("diagnosis.step_result") || "Результат"}</span>
        </div>
      </div>

      {error && (
        <div
          className="error-alert"
          style={{
            marginBottom: "2rem",
            padding: "12px",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            borderRadius: "8px",
          }}
        >
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            style={{
              width: "20px",
              height: "20px",
              display: "inline-block",
              verticalAlign: "text-bottom",
              marginRight: "8px",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {error}
        </div>
      )}

      {/* КРОК 1: ЗАВАНТАЖЕННЯ АБО ПРЕВ'Ю */}
      {currentStep === 1 && (
        <div className="diagnosis-grid-upload">
          <div className="upload-main-card">
            {!preview ? (
              <div className="upload-dropzone">
                <div className="dropzone-content">
                  <div className="upload-icon-large">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                      />
                    </svg>
                  </div>
                  <h3
                    dangerouslySetInnerHTML={{
                      __html:
                        t("diagnosis.upload_title") ||
                        "Перетягніть зображення сюди<br />або натисніть для вибору файлу",
                    }}
                  ></h3>
                  <p>
                    {t("diagnosis.upload_formats") ||
                      "Підтримуються формати: PNG, JPG (до 20MB)"}
                  </p>

                  <label
                    htmlFor="file-upload"
                    className="btn-primary upload-btn"
                  >
                    {t("diagnosis.btn_choose_file") || "Вибрати файл"}
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden-input"
                  />
                </div>
              </div>
            ) : (
              <div className="preview-ready-state">
                <div className="preview-image-box">
                  <img src={preview} alt="X-Ray Preview" />
                </div>
                <div className="preview-actions-box">
                  <h3>
                    {t("diagnosis.preview_title") ||
                      "Знімок готовий до аналізу"}
                  </h3>
                  <p className="text-muted">
                    {t("diagnosis.preview_desc") ||
                      "Модель ШІ проаналізує зображення на наявність ознак пневмонії."}
                  </p>
                  <button className="btn-primary w-100" onClick={handleAnalyze}>
                    {t("diagnosis.btn_start_analysis") || "Почати аналіз"}
                  </button>
                  <button
                    className="btn-outline w-100 mt-2"
                    onClick={handleReset}
                  >
                    {t("diagnosis.btn_choose_other") || "Вибрати інший файл"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="upload-tips-card">
            <h3>{t("diagnosis.tips_title") || "Поради для якісного знімка"}</h3>
            <ul className="tips-list">
              <li>
                <div className="icon-wrapper">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    style={{ width: "20px", height: "20px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </div>
                <span>
                  {t("diagnosis.tip1") ||
                    "Переконайтесь у правильному положенні пацієнта"}
                </span>
              </li>
              <li>
                <div className="icon-wrapper">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    style={{ width: "20px", height: "20px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
                <span>
                  {t("diagnosis.tip2") ||
                    "Зображення має бути чітким і без артефактів"}
                </span>
              </li>
              <li>
                <div className="icon-wrapper">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    style={{ width: "20px", height: "20px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                    />
                  </svg>
                </div>
                <span>
                  {t("diagnosis.tip3") ||
                    "Підтримуються передньо-задні та задньо-передні проекції"}
                </span>
              </li>
            </ul>
            <div className="disclaimer-box">
              {t("diagnosis.disclaimer") ||
                "Цей сервіс не замінює професійну медичну консультацію."}
            </div>
          </div>
        </div>
      )}

      {/* КРОК 2: АНАЛІЗ */}
      {currentStep === 2 && (
        <div className="analyzing-state">
          <div className="spinner-large"></div>
          <h2>{t("diagnosis.analyzing_title") || "Аналізуємо знімок..."}</h2>
          <p className="text-muted">
            {t("diagnosis.analyzing_desc") ||
              "Це може зайняти кілька секунд. Штучний інтелект шукає ознаки патологій."}
          </p>
        </div>
      )}

      {/* КРОК 3: РЕЗУЛЬТАТ */}
      {currentStep === 3 && result && (
        <div className="diagnosis-grid-result">
          {/* Ліва колонка: Знімок */}
          <div className="result-image-card">
            <img src={result.result_image_base64 || preview} alt="Analyzed" />
            <div className="image-footer">
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                {t("diagnosis.result_disclaimer") ||
                  "Результат має довідковий характер і не є остаточним діагнозом."}
              </span>
              <button
                className="btn-outline-small"
                onClick={() => window.print()}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{
                    width: "16px",
                    height: "16px",
                    marginRight: "6px",
                    verticalAlign: "text-bottom",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                {t("diagnosis.btn_save_report") || "Зберегти звіт"}
              </button>
            </div>
          </div>

          {/* Права колонка: Аналітика */}
          <div className="result-details-card">
            <h3>{t("diagnosis.results_title") || "Результат аналізу"}</h3>

            {/* ВЕРДИКТ */}
            <div className="probability-box">
              <div className={`verdict-badge verdict-${risk.color}`}>
                {risk.icon} {risk.title}
              </div>
              <div className="risk-level">{risk.label}</div>

              {/* === НОВИЙ БЛОК ЗІ ШКАЛОЮ ВАЖКОСТІ === */}
              {result.probability !== undefined && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "20px",
                    background: "var(--diag-dropzone)" /* Змінено з #f8fafc */,
                    borderRadius: "12px",
                    border:
                      "1px solid var(--diag-border)" /* Змінено з #e2e8f0 */,
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--diag-muted)" /* Змінено з #64748b */,
                        fontSize: "0.95rem",
                        fontWeight: "600",
                      }}
                    >
                      {t("diagnosis.probability") === "diagnosis.probability"
                        ? "Ймовірність патології:"
                        : t("diagnosis.probability")}
                    </span>
                    <span
                      style={{
                        fontSize: "2rem",
                        fontWeight: "800",
                        color: risk.color === "warning" ? "#ef4444" : "#22c55e",
                      }}
                    >
                      {result.probability}%
                    </span>
                  </div>

                  {/* ШКАЛА ВІЗУАЛІЗАЦІЇ */}
                  <div className="severity-scale-container">
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        color: "var(--sev-text-muted)",
                        marginBottom: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {t("diagnosis.sev_title") || "Діапазон оцінки ризику"}
                    </div>

                    {/* Кольорова лінія (залишаємо жорсткі кольори, бо це стандартні кольори світлофора) */}
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        height: "8px",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          background: "#22c55e",
                          borderRadius: "4px 0 0 4px",
                          opacity: !hasPneumonia ? 1 : 0.2,
                        }}
                      ></div>
                      <div
                        style={{
                          flex: 1,
                          background: "#eab308",
                          opacity:
                            hasPneumonia &&
                            result.probability >= 50 &&
                            result.probability < 60
                              ? 1
                              : 0.2,
                        }}
                      ></div>
                      <div
                        style={{
                          flex: 1,
                          background: "#f97316",
                          opacity:
                            hasPneumonia &&
                            result.probability >= 60 &&
                            result.probability < 85
                              ? 1
                              : 0.2,
                        }}
                      ></div>
                      <div
                        style={{
                          flex: 1,
                          background: "#ef4444",
                          borderRadius: "0 4px 4px 0",
                          opacity:
                            hasPneumonia && result.probability >= 85 ? 1 : 0.2,
                        }}
                      ></div>
                    </div>

                    {/* Легенда (Табличка з підтримкою Dark Mode) */}
                    <div
                      className="severity-legend"
                      style={{
                        fontSize: "0.85rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {/* Норма */}
                      <div
                        className={`severity-row ${!hasPneumonia ? "active-normal" : ""}`}
                      >
                        <span>
                          <span
                            style={{ color: "#22c55e", marginRight: "8px" }}
                          >
                            ●
                          </span>
                          &lt; 50.0
                        </span>
                        <span>
                          {t("diagnosis.sev_normal") || "Відхилень не виявлено"}
                        </span>
                      </div>

                      {/* Легка форма */}
                      <div
                        className={`severity-row ${hasPneumonia && result.probability >= 50 && result.probability < 60 ? "active-mild" : ""}`}
                      >
                        <span>
                          <span
                            style={{ color: "#eab308", marginRight: "8px" }}
                          >
                            ●
                          </span>
                          50.0 - 59.9
                        </span>
                        <span>
                          {t("diagnosis.sev_mild") || "Легка форма (початкова)"}
                        </span>
                      </div>

                      {/* Середня форма */}
                      <div
                        className={`severity-row ${hasPneumonia && result.probability >= 60 && result.probability < 85 ? "active-mod" : ""}`}
                      >
                        <span>
                          <span
                            style={{ color: "#f97316", marginRight: "8px" }}
                          >
                            ●
                          </span>
                          60.0 - 84.9
                        </span>
                        <span>
                          {t("diagnosis.sev_moderate") ||
                            "Середня форма (помірна)"}
                        </span>
                      </div>

                      {/* Гостра форма */}
                      <div
                        className={`severity-row ${hasPneumonia && result.probability >= 85 ? "active-sev" : ""}`}
                      >
                        <span>
                          <span
                            style={{ color: "#ef4444", marginRight: "8px" }}
                          >
                            ●
                          </span>
                          85.0 - 100
                        </span>
                        <span>
                          {t("diagnosis.sev_severe") ||
                            "Гостра форма (високий ризик)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* ================================ */}
              {hasPneumonia && (
                <div className="zones-count" style={{ marginTop: "12px" }}>
                  {t("diagnosis.zones_detected") || "Виявлено зон ураження:"}{" "}
                  <strong>
                    {result.detections_count ||
                      (result.boxes ? result.boxes.length : 0)}
                  </strong>
                </div>
              )}
            </div>

            {/* ВИЯВЛЕНІ ЗОНИ - показуємо ТІЛЬКИ якщо є пневмонія */}
            {hasPneumonia && (
              <div className="detected-areas-box">
                <h4>{t("diagnosis.found_areas") || "Виявлені області"}</h4>
                {result.boxes && result.boxes.length > 0 ? (
                  <ul className="areas-list">
                    {result.boxes.map((box, idx) => {
                      const imgWidth = result.image_size?.[0] ?? 1024;
                      const imgHeight = result.image_size?.[1] ?? 1024;
                      const side = getSide(box, imgWidth);
                      const areaPct = calcAreaPct(box, imgWidth, imgHeight);

                      return (
                        <li key={idx}>
                          <span className="area-dot"></span>
                          <div className="area-info">
                            <span className="area-text">
                              {t("diagnosis.area_label", { id: idx + 1 }) ||
                                `Зона ураження №${idx + 1}`}
                            </span>
                            <span className="area-sub">{side}</span>
                          </div>
                          <span className="area-score">{areaPct}%</span>
                        </li>
                      );
                    })}

                    {/* Загальна площа */}
                    {result.boxes.length > 1 && (
                      <div className="total-area-row">
                        {t("diagnosis.total_area") ||
                          "Загальна площа ураження:"}{" "}
                        <strong>
                          {calcTotalAreaPct(
                            result.boxes,
                            result.image_size?.[0] ?? 1024,
                            result.image_size?.[1] ?? 1024,
                          )}
                          %
                        </strong>
                      </div>
                    )}
                  </ul>
                ) : (
                  <div className="no-areas-found">
                    <svg
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      style={{
                        width: "20px",
                        height: "20px",
                        marginRight: "8px",
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {t("diagnosis.no_pathologies") ||
                      "Патологічних змін не виявлено"}
                  </div>
                )}
              </div>
            )}

            {/* РЕКОМЕНДАЦІЯ - показуємо ТІЛЬКИ якщо є пневмонія */}
            {hasPneumonia && (
              <div className="recommendation-box">
                <h4>{t("diagnosis.rec_title") || "Рекомендація"}</h4>
                <p>
                  {t("diagnosis.rec_pneumonia") ||
                    "Рекомендується термінова консультація лікаря-пульмонолога та додаткове обстеження."}
                </p>
              </div>
            )}

            {/* АЛЬТЕРНАТИВНА РЕКОМЕНДАЦІЯ - коли немає пневмонії */}
            {!hasPneumonia && (
              <div className="recommendation-box">
                <h4>{t("diagnosis.rec_title") || "Рекомендація"}</h4>
                <p>
                  {result.probability >= 20
                    ? t("diagnosis.rec_borderline") ||
                      "Показник у «сірій зоні». Чітких ознак пневмонії немає, але присутні незначні відхилення або тіні. Рекомендується спостереження та огляд лікаря за наявності симптомів (кашель, температура)."
                    : t("diagnosis.rec_normal") ||
                      "Знімок у межах норми. Рекомендується плановий огляд за графіком."}
                </p>
              </div>
            )}

            <button className="btn-outline w-100 mt-4" onClick={handleReset}>
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{
                  width: "18px",
                  height: "18px",
                  marginRight: "8px",
                  verticalAlign: "text-bottom",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              {t("diagnosis.btn_new_analysis") || "Новий аналіз"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiagnosisPage;
