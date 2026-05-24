import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "../styles/TrainingPage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function TrainingPage({ onBack, userId }) {
  const { t } = useTranslation();

  const [trainingImages, setTrainingImages] = useState([]);
  const [examImages, setExamImages] = useState([]);

  const [sessionMode, setSessionMode] = useState("lobby");
  const [lobbyTab, setLobbyTab] = useState("practice");
  const [visibleCount, setVisibleCount] = useState(6);

  const [currentImage, setCurrentImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [studentBoxes, setStudentBoxes] = useState([]);
  const [saidNoPneumonia, setSaidNoPneumonia] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const EXAM_TOTAL_IMAGES = 15;
  const EXAM_TIME_LIMIT = 30;
  const [examTimeLeft, setExamTimeLeft] = useState(EXAM_TIME_LIMIT);
  const [examCurrentIndex, setExamCurrentIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState([]);
  const [isExamFinished, setIsExamFinished] = useState(false);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const correctCanvasRef = useRef(null);

  const practiceCorrectImgRef = useRef(null);
  const [practiceCorrectDims, setPracticeCorrectDims] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const trainRes = await axios.get(`${API_BASE}/api/dataset/training`);
        // 🚀 ФІКС: Автоматично додаємо слеш, якщо його забув бекенд
        const fixedTrain = trainRes.data.map((img) => ({
          ...img,
          url: img.url.includes("pneumo_final_dataset/")
            ? img.url
            : img.url.replace("pneumo_final_dataset", "pneumo_final_dataset/"),
        }));
        setTrainingImages(fixedTrain);

        const examRes = await axios.get(`${API_BASE}/api/dataset/exam`);
        // 🚀 ФІКС: І для екзаменаційних знімків теж
        const fixedExam = examRes.data.map((img) => ({
          ...img,
          url: img.url.includes("pneumo_final_dataset/")
            ? img.url
            : img.url.replace("pneumo_final_dataset", "pneumo_final_dataset/"),
        }));
        setExamImages(fixedExam);
      } catch (error) {
        console.error("Помилка завантаження датасету:", error);
      }
    };
    fetchDatasets();
  }, []);

  const startDifficultyPractice = (level) => {
    setSelectedDifficulty(level);
    const filtered = trainingImages.filter((img) => img.difficulty === level);

    if (filtered.length === 0) {
      alert(t("training.error_no_images_level", { level }));
      return;
    }

    const randomImg = filtered[Math.floor(Math.random() * filtered.length)];
    setStudentBoxes([]);
    setSaidNoPneumonia(false);
    setResult(null);
    setCurrentImage(randomImg);
    setImageUrl(randomImg.url);
    setSessionMode("practice");
  };

  const loadNewImage = async (examIdx = null) => {
    setLoading(true);
    setError(null);
    setStudentBoxes([]);
    setSaidNoPneumonia(false);
    setResult(null);
    setImageUrl(null);
    setCurrentImage(null);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    try {
      if (sessionMode === "practice") {
        if (trainingImages.length === 0) return;
        const filtered =
          selectedDifficulty === "all"
            ? trainingImages
            : trainingImages.filter(
                (img) => img.difficulty === selectedDifficulty,
              );

        if (filtered.length === 0) {
          setError(
            t("training.error_no_images_level", { level: selectedDifficulty }),
          );
          return;
        }

        const randomImg = filtered[Math.floor(Math.random() * filtered.length)];
        setCurrentImage(randomImg);
        setImageUrl(randomImg.url);
      } else if (sessionMode === "exam") {
        if (examImages.length === 0) return;
        const idx = examIdx !== null ? examIdx : examCurrentIndex;
        const nextImg = examImages[idx];
        setCurrentImage(nextImg);
        setImageUrl(`${nextImg.url}?t=${new Date().getTime()}`);
      }
    } catch (err) {
      setError(t("training.error_load", { message: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const setupCanvas = () => {
    if (imageRef.current && canvasRef.current) {
      canvasRef.current.width = imageRef.current.offsetWidth;
      canvasRef.current.height = imageRef.current.offsetHeight;
      redrawCanvas();
    }
  };

  useEffect(() => {
    redrawCanvas();
  }, [studentBoxes, imageUrl, result]);

  const redrawCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scaleX = canvas.offsetWidth / img.naturalWidth;
    const scaleY = canvas.offsetHeight / img.naturalHeight;

    studentBoxes.forEach((box, idx) => {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      const x = box.x1 * scaleX,
        y = box.y1 * scaleY;
      const width = (box.x2 - box.x1) * scaleX,
        height = (box.y2 - box.y1) * scaleY;

      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.roundRect(x, y - 24, 24, 24, [4, 4, 0, 0]);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "bold 13px system-ui";
      ctx.fillText(`${idx + 1}`, x + 8, y - 7);
    });
  };

  const handleCanvasMouseDown = (e) => {
    if (result || !canvasRef.current || !imageRef.current) return;
    const scaleX =
      imageRef.current.naturalWidth / canvasRef.current.offsetWidth;
    const scaleY =
      imageRef.current.naturalHeight / canvasRef.current.offsetHeight;
    setStartPos({
      x1: e.nativeEvent.offsetX * scaleX,
      y1: e.nativeEvent.offsetY * scaleY,
    });
    setIsDrawing(true);
  };

  const handleCanvasMouseMove = (e) => {
    if (
      !isDrawing ||
      !startPos ||
      result ||
      !canvasRef.current ||
      !imageRef.current
    )
      return;
    const scaleX =
      imageRef.current.naturalWidth / canvasRef.current.offsetWidth;
    const scaleY =
      imageRef.current.naturalHeight / canvasRef.current.offsetHeight;
    const currentX = e.nativeEvent.offsetX;
    const currentY = e.nativeEvent.offsetY;

    redrawCanvas();
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);

    const screenStartX = startPos.x1 / scaleX;
    const screenStartY = startPos.y1 / scaleY;

    ctx.strokeRect(
      screenStartX,
      screenStartY,
      currentX - screenStartX,
      currentY - screenStartY,
    );
    ctx.setLineDash([]);
  };

  const handleCanvasMouseUp = (e) => {
    if (
      !isDrawing ||
      !startPos ||
      result ||
      !canvasRef.current ||
      !imageRef.current
    )
      return;
    const scaleX =
      imageRef.current.naturalWidth / canvasRef.current.offsetWidth;
    const scaleY =
      imageRef.current.naturalHeight / canvasRef.current.offsetHeight;
    const x2 = e.nativeEvent.offsetX * scaleX;
    const y2 = e.nativeEvent.offsetY * scaleY;

    if (Math.abs(x2 - startPos.x1) > 20 && Math.abs(y2 - startPos.y1) > 20) {
      setStudentBoxes((prev) => [
        ...prev,
        {
          x1: Math.min(startPos.x1, x2),
          y1: Math.min(startPos.y1, y2),
          x2: Math.max(startPos.x1, x2),
          y2: Math.max(startPos.y1, y2),
        },
      ]);
    }
    setIsDrawing(false);
    setStartPos(null);
  };

  const handleClearBoxes = () => setStudentBoxes([]);

  const handleCheckAnswer = async (isNormal = false) => {
    if (!currentImage) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE}/api/dataset/check-answer`,
        {
          image_id: currentImage.id,
          boxes: isNormal ? [] : studentBoxes,
          said_no_pneumonia: isNormal,
          user_id: userId,
          difficulty: currentImage?.difficulty || "medium",
          session_mode: sessionMode,
        },
      );
      setResult(response.data);
    } catch (err) {
      setError(t("training.error_check", { message: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    if (!examImages || examImages.length < EXAM_TOTAL_IMAGES) {
      alert(t("training.error_exam_loading"));
      return;
    }
    const shuffled = [...examImages].sort(() => Math.random() - 0.5);
    setExamImages(shuffled);
    setSessionMode("exam");
    setExamCurrentIndex(0);
    setExamAnswers([]);
    setIsExamFinished(false);
    setExamTimeLeft(EXAM_TIME_LIMIT);

    const firstImg = shuffled[0];
    setCurrentImage(firstImg);
    setImageUrl(firstImg.url);
    setStudentBoxes([]);
    setResult(null);
  };

  useEffect(() => {
    let timer;
    if (sessionMode === "exam" && !isExamFinished && !loading && imageUrl) {
      timer = setInterval(() => {
        setExamTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleExamSubmit(false, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionMode, isExamFinished, loading, imageUrl]);

  const handleExamSubmit = async (isNormal = false, timeUp = false) => {
    if (!currentImage || typeof currentImage === "string") return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/dataset/check-answer`,
        {
          image_id: currentImage.id,
          boxes: isNormal ? [] : studentBoxes,
          said_no_pneumonia: isNormal,
          user_id: userId,
          difficulty: currentImage.difficulty || "medium",
          session_mode: "exam",
        },
      );

      setExamAnswers((prev) => [
        ...prev,
        {
          score: response.data.score,
          details: response.data.details,
          timeUp,
          imageId: currentImage.id,
          imageUrl: currentImage.url,
          userBoxes: isNormal ? [] : studentBoxes,
          gtBoxes: response.data.ground_truth_boxes,
        },
      ]);

      const nextIdx = examCurrentIndex + 1;
      if (nextIdx >= EXAM_TOTAL_IMAGES || nextIdx >= examImages.length) {
        setIsExamFinished(true);
      } else {
        const nextImg = examImages[nextIdx];
        setExamCurrentIndex(nextIdx);
        setExamTimeLeft(EXAM_TIME_LIMIT);
        setCurrentImage(nextImg);
        setImageUrl(nextImg.url);
        setStudentBoxes([]);
        setResult(null);
      }
    } catch (err) {
      setError(t("training.error_check", { message: err.message }));
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // РЕНДЕР: ГОЛОВНЕ ЛОБІ
  // ==========================================
  if (sessionMode === "lobby") {
    return (
      <div className="training-page">
        <h1 className="page-main-title">{t("training.title")}</h1>

        <div className="tabs-pill-container">
          <button
            className={`tab-pill ${lobbyTab === "practice" ? "active" : ""}`}
            onClick={() => setLobbyTab("practice")}
          >
            {t("training.practice_tab")}
          </button>
          <button
            className={`tab-pill ${lobbyTab === "exam" ? "active" : ""}`}
            onClick={() => setLobbyTab("exam")}
          >
            {t("training.exam_tab")}
          </button>
        </div>

        {lobbyTab === "practice" && (
          <div className="practice-lobby-section">
            <div className="section-header-row">
              <div className="section-titles">
                <h2>{t("training.diff_select_title")}</h2>
                <p>{t("training.diff_select_desc")}</p>
              </div>
            </div>

            <div className="difficulty-cards-grid">
              {/* ЛЕГКИЙ РІВЕНЬ */}
              <div className="diff-card easy">
                <div
                  className="star-rating"
                  style={{ display: "flex", gap: "4px", marginBottom: "10px" }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#22c55e"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3>{t("training.diff_easy_title")}</h3>
                <p>{t("training.diff_easy_desc")}</p>
                <button
                  className="btn-start-diff"
                  onClick={() => startDifficultyPractice("easy")}
                >
                  {t("training.btn_start_practice")}
                </button>
              </div>

              {/* СЕРЕДНІЙ РІВЕНЬ */}
              <div className="diff-card medium">
                <div
                  className="star-rating"
                  style={{ display: "flex", gap: "4px", marginBottom: "10px" }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#f97316"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#f97316"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3>{t("training.diff_medium_title")}</h3>
                <p>{t("training.diff_medium_desc")}</p>
                <button
                  className="btn-start-diff"
                  onClick={() => startDifficultyPractice("medium")}
                >
                  {t("training.btn_start_practice")}
                </button>
              </div>

              {/* СКЛАДНИЙ РІВЕНЬ */}
              <div className="diff-card hard">
                <div
                  className="star-rating"
                  style={{ display: "flex", gap: "4px", marginBottom: "10px" }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#ef4444"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#ef4444"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#ef4444"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3>{t("training.diff_hard_title")}</h3>
                <p>{t("training.diff_hard_desc")}</p>
                <button
                  className="btn-start-diff"
                  onClick={() => startDifficultyPractice("hard")}
                >
                  {t("training.btn_start_practice")}
                </button>
              </div>
            </div>
          </div>
        )}

        {lobbyTab === "exam" && (
          <div className="exam-lobby-section">
            <div className="exam-start-card">
              <div
                className="exam-icon-large"
                style={{
                  color: "#3b82f6",
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  style={{ width: "80px", height: "80px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2>{t("training.exam_title")}</h2>
              <p>{t("training.exam_desc")}</p>
              <button className="btn-primary-large mt-4" onClick={startExam}>
                {t("training.btn_start_exam")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // РЕНДЕР: ЗВІТ ПРО ІСПИТ
  // ==========================================
  if (sessionMode === "exam" && isExamFinished) {
    const avgScore =
      examAnswers.reduce((acc, curr) => acc + curr.score, 0) /
      examAnswers.length;
    const totalMissed = examAnswers.reduce(
      (s, a) => s + (a.details?.missed || 0),
      0,
    );
    const totalFalse = examAnswers.reduce(
      (s, a) => s + (a.details?.false_positives || 0),
      0,
    );
    const avgRelError =
      examAnswers.reduce((s, a) => s + (a.details?.relative_error || 0), 0) /
      examAnswers.length;

    let recKey = "training.recommendations.general";
    if (avgScore >= 90) recKey = "training.recommendations.excellent";
    else if (totalFalse > totalMissed && totalFalse > 2)
      recKey = "training.recommendations.overdiagnosis";
    else if (totalMissed > totalFalse && totalMissed > 2)
      recKey = "training.recommendations.underdiagnosis";
    else if (avgRelError > 35) recKey = "training.recommendations.precision";
    else if (avgScore < 60) recKey = "training.recommendations.hard_practice";

    return (
      <div className="training-page">
        <div className="result-dashboard" style={{ padding: "30px" }}>
          <div
            className="result-header"
            style={{ textAlign: "center", marginBottom: "30px" }}
          >
            <h2 style={{ fontSize: "28px", color: "var(--train-text)" }}>
              {t("training.exam_report_title")}
            </h2>
            <div
              className={`final-score-circle ${avgScore >= 80 ? "success" : "danger"}`}
              style={{
                margin: "20px auto",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "8px solid",
                fontSize: "32px",
                fontWeight: "bold",
              }}
            >
              {avgScore.toFixed(0)}%
            </div>
            <div
              style={{
                background:
                  avgScore >= 80
                    ? "rgba(46, 204, 113, 0.1)"
                    : "rgba(231, 76, 60, 0.1)",
                borderLeft: `4px solid ${avgScore >= 80 ? "#2ecc71" : "#e74c3c"}`,
                padding: "15px 20px",
                borderRadius: "0 8px 8px 0",
                maxWidth: "600px",
                margin: "0 auto 20px",
                textAlign: "left",
              }}
            >
              <strong
                style={{
                  display: "block",
                  marginBottom: "5px",
                  color: "var(--train-text)",
                }}
              >
                {t("training.recommendations.title")}
              </strong>
              <span
                style={{
                  color: "var(--train-muted)",
                  fontSize: "15px",
                  lineHeight: "1.5",
                }}
              >
                {t(recKey)}
              </span>
            </div>
          </div>

          <div
            className="stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            <div
              className="stat-card"
              style={{
                textAlign: "center",
                padding: "20px",
                background: "var(--train-input)",
                border: "1px solid var(--train-border)",
                borderRadius: "12px",
              }}
            >
              <div style={{ fontSize: "14px", color: "var(--train-muted)" }}>
                {t("training.stats_images")}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "var(--train-text)",
                }}
              >
                {examAnswers.length}
              </div>
            </div>
            <div
              className="stat-card"
              style={{
                textAlign: "center",
                padding: "20px",
                background: "rgba(239, 68, 68, 0.05)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "12px",
              }}
            >
              <div style={{ fontSize: "14px", color: "#e11d48" }}>
                {t("training.stats_missed")}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#e11d48",
                }}
              >
                {totalMissed}
              </div>
            </div>
            <div
              className="stat-card"
              style={{
                textAlign: "center",
                padding: "20px",
                background: "rgba(245, 158, 11, 0.05)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: "12px",
              }}
            >
              <div style={{ fontSize: "14px", color: "#d97706" }}>
                {t("training.stats_false")}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#d97706",
                }}
              >
                {totalFalse}
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: "20px", color: "var(--train-text)" }}>
            {t("training.exam_details_title")}
          </h3>
          <div
            className="exam-review-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "25px",
            }}
          >
            {examAnswers.map((ans, index) => (
              <ExamReviewItem key={index} answer={ans} index={index} t={t} />
            ))}
          </div>

          <button
            className="btn-primary full-width"
            onClick={() => window.location.reload()}
          >
            {t("training.btn_new_exam")}
          </button>
          <button
            className="btn-ghost full-width mt-2"
            style={{ justifyContent: "center" }}
            onClick={() => setSessionMode("lobby")}
          >
            {t("training.btn_back_menu")}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // РЕНДЕР: РОБОЧА ЗОНА (ПРАКТИКА ТА ІСПИТ)
  // ==========================================
  return (
    <div className="training-page workspace-mode">
      <div className="workspace-header">
        <button className="btn-ghost" onClick={() => setSessionMode("lobby")}>
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            style={{ width: "20px", height: "20px", marginRight: "8px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          {sessionMode === "exam"
            ? t("training.btn_interrupt_exam")
            : t("training.back_btn")}
        </button>

        {sessionMode === "exam" ? (
          <>
            <div className="progress-indicator">
              {t("training.exam_progress", {
                current: examCurrentIndex + 1,
                total: EXAM_TOTAL_IMAGES,
              })}
            </div>
            <div
              className={`timer-badge ${examTimeLeft <= 10 ? "danger-pulse" : ""}`}
            >
              ⏱ 00:{examTimeLeft < 10 ? `0${examTimeLeft}` : examTimeLeft}
            </div>
          </>
        ) : (
          <div className="progress-indicator practice">
            {t("training.mode_practice")}
          </div>
        )}
      </div>

      <div className="editor-layout">
        <div className="main-editor-area">
          <div
            className="canvas-wrapper modern-shadow"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "var(--train-canvas-bg)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              {imageUrl && (
                <>
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    crossOrigin="anonymous"
                    alt="Medical scan"
                    style={{
                      display: "block",
                      maxWidth: "100%",
                      maxHeight: "70vh",
                      width: "auto",
                      height: "auto",
                    }}
                    onLoad={setupCanvas}
                  />
                  <canvas
                    ref={canvasRef}
                    className="drawing-canvas"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      cursor: result ? "default" : "crosshair",
                    }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                </>
              )}
            </div>
            {loading && (
              <div className="overlay-loader">
                <div className="spinner"></div>
                <span>{t("training.loading")}</span>
              </div>
            )}
          </div>

          <div className="action-bar modern-shadow">
            <div className="action-info">
              <span className="info-title">
                {t("training.boxes_drawn", { count: studentBoxes.length })}
              </span>
              <span className="info-subtitle">
                {t("training.instruction_drag")}
              </span>
            </div>
            <div className="action-buttons">
              <button
                className="btn-outline"
                onClick={handleClearBoxes}
                disabled={studentBoxes.length === 0 || result}
              >
                {t("training.btn_clear")}
              </button>
              <button
                className="btn-secondary"
                onClick={() =>
                  sessionMode === "exam"
                    ? handleExamSubmit(true)
                    : handleCheckAnswer(true)
                }
                disabled={loading || studentBoxes.length > 0 || result}
              >
                {t("training.btn_normal")}
              </button>
              <button
                className="btn-primary"
                onClick={() =>
                  sessionMode === "exam"
                    ? handleExamSubmit(false)
                    : handleCheckAnswer(false)
                }
                disabled={
                  loading ||
                  (sessionMode !== "exam" && studentBoxes.length === 0) ||
                  result
                }
              >
                {sessionMode === "exam"
                  ? t("training.btn_submit_exam")
                  : t("training.btn_check")}
              </button>
            </div>
          </div>
        </div>

        {sessionMode === "practice" && result && (
          <div className="results-sidebar modern-shadow">
            <div className="sidebar-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <h3>{t("training.result_title")}</h3>
                <span
                  className="case-badge"
                  style={{
                    background: "var(--train-input)",
                    color: "var(--train-muted)",
                    fontSize: "12px",
                    border: "1px solid var(--train-border)",
                  }}
                >
                  {currentImage?.difficulty === "easy"
                    ? t("training.diff_easy")
                    : currentImage?.difficulty === "medium"
                      ? t("training.diff_medium")
                      : t("training.diff_hard")}
                </span>
              </div>
              <div
                className={`mini-score ${result.score >= 80 ? "success" : result.score >= 50 ? "warning" : "danger"}`}
              >
                {result.score.toFixed(1)}%
              </div>
            </div>

            <div className="feedback-content">
              {(() => {
                const { feedback_code, details } = result;
                if (feedback_code === "correct_no_pneumonia")
                  return (
                    <div className="alert success">
                      {t("training.feedback_correct_no_pneumonia")}
                    </div>
                  );
                if (feedback_code === "false_positive_healthy")
                  return (
                    <div className="alert warning">
                      {t("training.feedback_false_positive_healthy", {
                        count: details?.false_positives,
                      })}
                    </div>
                  );
                if (feedback_code === "critical_miss")
                  return (
                    <div className="alert danger">
                      {t("training.feedback_critical_miss", {
                        count: details?.total_gt,
                      })}
                    </div>
                  );
                if (feedback_code === "match_result")
                  return (
                    <div className="metrics-list">
                      <div className="metric-item">
                        <span>{t("training.metric_iou")}</span>
                        <strong>{(details.mean_iou * 100).toFixed(1)}%</strong>
                      </div>
                      {details?.missed > 0 && (
                        <div
                          className="metric-item error"
                          style={{ color: "#ef4444" }}
                        >
                          <span>{t("training.stats_missed")}</span>
                          <strong>{details.missed}</strong>
                        </div>
                      )}
                      {details?.false_positives > 0 && (
                        <div
                          className="metric-item warning"
                          style={{ color: "#f59e0b" }}
                        >
                          <span>{t("training.stats_false")}</span>
                          <strong>{details.false_positives}</strong>
                        </div>
                      )}
                    </div>
                  );
                return <p>Результат сформовано.</p>;
              })()}
            </div>

            {result.ground_truth_boxes?.length > 0 && (
              <div className="comparison-mini">
                <h4
                  style={{
                    color: "var(--train-muted)",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                  }}
                >
                  {t("training.correct_boxes")}
                </h4>
                <div
                  className="comparison-wrapper"
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "100%",
                    background: "#000",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    ref={practiceCorrectImgRef}
                    src={imageUrl}
                    crossOrigin="anonymous"
                    alt="AI Result"
                    className="comparison-image"
                    style={{ width: "100%", display: "block", height: "auto" }}
                    onLoad={(e) => {
                      setPracticeCorrectDims({
                        width: e.target.clientWidth,
                        height: e.target.clientHeight,
                        naturalWidth: e.target.naturalWidth,
                        naturalHeight: e.target.naturalHeight,
                      });
                    }}
                  />
                  {practiceCorrectDims.width > 0 && (
                    <svg
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                      }}
                    >
                      {result.ground_truth_boxes.map((box, bIdx) => {
                        const scaleX =
                          practiceCorrectDims.width /
                            practiceCorrectDims.naturalWidth || 1;
                        const scaleY =
                          practiceCorrectDims.height /
                            practiceCorrectDims.naturalHeight || 1;
                        const x1 = (box[0] ?? box.x1) * scaleX;
                        const y1 = (box[1] ?? box.y1) * scaleY;
                        const x2 = (box[2] ?? box.x2) * scaleX;
                        const y2 = (box[3] ?? box.y2) * scaleY;
                        return (
                          <rect
                            key={bIdx}
                            x={x1}
                            y={y1}
                            width={Math.max(0, x2 - x1)}
                            height={Math.max(0, y2 - y1)}
                            fill="none"
                            stroke="#00e676"
                            strokeWidth="3"
                          />
                        );
                      })}
                    </svg>
                  )}
                </div>
              </div>
            )}

            <button
              className="btn-primary full-width mt-auto"
              onClick={() => {
                setStudentBoxes([]);
                setSaidNoPneumonia(false);
                setResult(null);
                loadNewImage();
              }}
            >
              {t("training.btn_next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const ExamReviewItem = ({ answer, index, t }) => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    naturalWidth: 1,
    naturalHeight: 1,
  });

  const handleImageLoad = (e) => {
    setDimensions({
      width: e.target.clientWidth,
      height: e.target.clientHeight,
      naturalWidth: e.target.naturalWidth || 1024,
      naturalHeight: e.target.naturalHeight || 1024,
    });
  };

  const scaleX = dimensions.width / dimensions.naturalWidth;
  const scaleY = dimensions.height / dimensions.naturalHeight;

  return (
    <div
      className="review-card"
      style={{
        background: "var(--train-card)",
        padding: "15px",
        borderRadius: "12px",
        border: "1px solid var(--train-border)",
      }}
    >
      <div
        className="review-info"
        style={{ marginBottom: "10px", color: "var(--train-text)" }}
      >
        <p style={{ margin: "0", fontSize: "16px", fontWeight: "bold" }}>
          {t("training.image_number", { id: index + 1 })}
        </p>
        <div
          style={{
            display: "flex",
            justifycontent: "space-between",
            marginTop: "5px",
            fontSize: "13px",
            color: "var(--train-muted)",
          }}
        ></div>
        <p
          style={{ margin: "5px 0 0", fontWeight: "bold", textAlign: "right" }}
        >
          {t("training.score_label")}{" "}
          <span style={{ color: answer.score > 70 ? "#22c55e" : "#ef4444" }}>
            {answer.score.toFixed(0)}%
          </span>
        </p>
      </div>

      <div
        style={{
          position: "relative",
          background: "#000",
          borderRadius: "8px",
          overflow: "hidden",
          width: "100%",
          display: "inline-block",
        }}
      >
        <img
          src={answer.imageUrl}
          alt={`Exam Scan ${index + 1}`}
          style={{ width: "100%", display: "block", height: "auto" }}
          onLoad={handleImageLoad}
        />
        {dimensions.width > 0 && (
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            {answer.gtBoxes?.map((box, bIdx) => {
              const x1 = (box[0] ?? box.x1) * scaleX;
              const y1 = (box[1] ?? box.y1) * scaleY;
              const x2 = (box[2] ?? box.x2) * scaleX;
              const y2 = (box[3] ?? box.y2) * scaleY;
              return (
                <rect
                  key={`gt-${bIdx}`}
                  x={x1}
                  y={y1}
                  width={Math.max(0, x2 - x1)}
                  height={Math.max(0, y2 - y1)}
                  fill="none"
                  stroke="#00e676"
                  strokeWidth="2.5"
                />
              );
            })}
            {answer.userBoxes?.map((box, bIdx) => {
              const x1 = box.x1 * scaleX;
              const y1 = box.y1 * scaleY;
              const x2 = box.x2 * scaleX;
              const y2 = box.y2 * scaleY;
              return (
                <rect
                  key={`user-${bIdx}`}
                  x={x1}
                  y={y1}
                  width={Math.max(0, x2 - x1)}
                  height={Math.max(0, y2 - y1)}
                  fill="none"
                  stroke="#ff1744"
                  strokeWidth="2.5"
                  strokeDasharray="4,3"
                />
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};

export default TrainingPage;
