import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../styles/AdminDashboard.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const AWS_S3_BASE_URL = import.meta.env.VITE_AWS_S3_BASE_URL;
const COLORS = ["#ef4444", "#10b981", "#3b82f6", "#f59e0b"];

const AdminResultSVGOverlay = ({ imageUrl, userBoxes, gtBoxes }) => {
  const [dims, setDims] = useState({
    width: 0,
    height: 0,
    naturalWidth: 1,
    naturalHeight: 1,
  });

  return (
    <div
      style={{
        position: "relative",
        background: "#000",
        borderRadius: "8px",
        overflow: "hidden",
        width: "100%",
        display: "inline-block",
        marginTop: "15px",
      }}
    >
      <img
        src={imageUrl}
        alt="Admin Medical Review"
        style={{ width: "100%", display: "block", height: "auto" }}
        onLoad={(e) =>
          setDims({
            width: e.target.clientWidth,
            height: e.target.clientHeight,
            naturalWidth: e.target.naturalWidth || 1024,
            naturalHeight: e.target.naturalHeight || 1024,
          })
        }
      />
      {dims.width > 0 && (
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
          {Array.isArray(gtBoxes) &&
            gtBoxes.map((box, bIdx) => {
              const scaleX = dims.width / dims.naturalWidth;
              const scaleY = dims.height / dims.naturalHeight;
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
          {Array.isArray(userBoxes) &&
            userBoxes.map((box, bIdx) => {
              const scaleX = dims.width / dims.naturalWidth;
              const scaleY = dims.height / dims.naturalHeight;
              const b = Array.isArray(box)
                ? box
                : [box.x1, box.y1, box.x2, box.y2];
              return (
                <rect
                  key={`user-${bIdx}`}
                  x={b[0] * scaleX}
                  y={b[1] * scaleY}
                  width={Math.max(0, (b[2] - b[0]) * scaleX)}
                  height={Math.max(0, (b[3] - b[1]) * scaleY)}
                  fill="none"
                  stroke="#ff1744"
                  strokeWidth="2.5"
                  strokeDasharray="5,4"
                />
              );
            })}
        </svg>
      )}
    </div>
  );
};

const extractArray = (b) => {
  if (!b) return [];
  let parsed = b;
  if (typeof b === "string") {
    try {
      parsed = JSON.parse(b.replace(/'/g, '"'));
    } catch (e) {
      return [];
    }
  }
  if (Array.isArray(parsed)) return parsed;
  if (typeof parsed === "object" && parsed !== null) {
    for (let key in parsed) {
      if (Array.isArray(parsed[key])) return parsed[key];
    }
  }
  return [];
};

const ResultCanvas = ({ imageUrl, userBoxes, gtBoxes }) => {
  const [dims, setDims] = useState({
    width: 0,
    height: 0,
    naturalWidth: 1,
    naturalHeight: 1,
  });

  const handleImageLoad = (e) => {
    setDims({
      width: e.target.clientWidth,
      height: e.target.clientHeight,
      naturalWidth: e.target.naturalWidth || 1024,
      naturalHeight: e.target.naturalHeight || 1024,
    });
  };

  const scaleX = dims.width / dims.naturalWidth;
  const scaleY = dims.height / dims.naturalHeight;

  const safeGtBoxes = extractArray(gtBoxes);
  const safeUserBoxes = extractArray(userBoxes);

  if (!imageUrl || imageUrl.includes("undefined")) {
    return (
      <div
        style={{
          width: "100%",
          height: "250px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1e293b",
          borderRadius: "8px",
          border: "1px dashed var(--border-color)",
          marginTop: "15px",
          color: "var(--text-muted)",
        }}
      >
        Знімок недоступний через CORS
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        background: "#000",
        borderRadius: "8px",
        overflow: "hidden",
        width: "100%",
        display: "inline-block",
        marginTop: "15px",
      }}
    >
      <img
        src={imageUrl}
        alt="Admin Medical Review Scan"
        style={{ width: "100%", display: "block", height: "auto" }}
        onLoad={handleImageLoad}
      />

      {dims.width > 0 && (
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
          {/* 1. Еталонні зелені рамки лікаря */}
          {safeGtBoxes.map((box, bIdx) => {
            const x1 = (box[0] ?? box.x1) * scaleX;
            const y1 = (box[1] ?? box.y1) * scaleY;
            const x2 = (box[2] ?? box.x2) * scaleX;
            const y2 = (box[3] ?? box.y2) * scaleY;
            return (
              <rect
                key={`admin-gt-${bIdx}`}
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

          {/* 2. Рамки студента */}
          {safeUserBoxes.map((box, bIdx) => {
            const b = Array.isArray(box)
              ? box
              : [box.x1, box.y1, box.x2, box.y2];
            const x1 = b[0] * scaleX;
            const y1 = b[1] * scaleY;
            const x2 = b[2] * scaleX;
            const y2 = b[3] * scaleY;
            return (
              <rect
                key={`admin-usr-${bIdx}`}
                x={x1}
                y={y1}
                width={Math.max(0, x2 - x1)}
                height={Math.max(0, y2 - y1)}
                fill="none"
                stroke="#ff1744"
                strokeWidth="2.5"
                strokeDasharray="5,4"
              />
            );
          })}
        </svg>
      )}
    </div>
  );
};

function AdminDashboard({ onLogout }) {
  const { t, i18n } = useTranslation();

  const [systemName, setSystemName] = useState("LungAI");
  const [tempSystemName, setTempSystemName] = useState("LungAI");
  const [adminData, setAdminData] = useState({
    name: "Admin",
    email: "admin@gmail.com",
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  // СТАНИ КОРИСТУВАЧІВ
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    role: "user",
  });
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // СТАНИ ДЛЯ ДАТАСЕТУ
  const [datasetList, setDatasetList] = useState([]);
  const [datasetViewLimit, setDatasetViewLimit] = useState(6);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAnalyses: 0,
    avgAccuracy: 0,
    activeSessions: 0,
  });
  const [usersList, setUsersList] = useState([]);
  const [allAnalyses, setAllAnalyses] = useState([]);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    status: "normal",
  });
  const [platformName, setPlatformName] = useState("LungAI");

  const [tempPlatformName, setTempPlatformName] = useState("LungAI");
  // Стейт для імені адміністратора
  const [adminName, setAdminName] = useState("Адміністратор");

  // Функція зміни мови зі збереженням у пам'ять браузера
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem("i18nextLng", newLang);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("i18nextLng");
    if (savedLang) i18n.changeLanguage(savedLang);

    document.body.classList.add("dark-mode");
    fetchRealData();
  }, []);

  const groupAnalyses = (data) => {
    const display = [];
    let examBuffer = [];

    data.forEach((res, index) => {
      const isExam = res.mode === "exam" || res.mode === "іспит";
      if (isExam) {
        examBuffer.push(res);
        const nextItem = data[index + 1];
        const nextIsExam =
          nextItem && (nextItem.mode === "exam" || nextItem.mode === "іспит");

        let closeGroup = false;
        if (
          !nextItem ||
          !nextIsExam ||
          examBuffer.length === 15 ||
          nextItem.userEmail !== res.userEmail
        ) {
          closeGroup = true;
        } else {
          const t1 = new Date(
            res.date.endsWith("Z") ? res.date : res.date + "Z",
          );
          const t2 = new Date(
            nextItem.date.endsWith("Z") ? nextItem.date : nextItem.date + "Z",
          );
          if (Math.abs(t1 - t2) > 10 * 60 * 1000) closeGroup = true;
        }

        if (closeGroup) {
          const avgScore =
            examBuffer.reduce((sum, r) => sum + r.prob, 0) / examBuffer.length;
          display.push({
            is_group: true,
            id: `exam_${res.id}`,
            mode: "exam",
            difficulty: "mixed",
            date: examBuffer[examBuffer.length - 1].date,
            prob: avgScore.toFixed(1),
            iou: "-",
            rel: "-",
            mse: "-",
            userName: examBuffer[0].userName,
            userEmail: examBuffer[0].userEmail,
            items: [...examBuffer].reverse(),
          });
          examBuffer = [];
        }
      } else {
        display.push(res);
      }
    });
    return display;
  };

  const handleUploadImage = async (e) => {
    e.preventDefault();
    if (!uploadData.file) return alert(t("admin.upload.error_no_file"));

    const formData = new FormData();
    formData.append("file", uploadData.file);
    formData.append("status", uploadData.status);

    try {
      await axios.post(`${API_BASE}/api/admin/dataset/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(t("admin.upload.success"));
      setShowUploadModal(false);
      setUploadData({ file: null, status: "normal" });
      fetchRealData();
    } catch (error) {
      alert(
        t("admin.upload.error") +
          ": " +
          (error.response?.data?.detail || error.message),
      );
    }
  };

  const fetchRealData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        usersRes,
        allAnalysesRes,
        recentAnalysesRes,
        chartRes,
        pieRes,
        datasetRes,
      ] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/stats`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/api/admin/users`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/admin/analyses`).catch(() => ({ data: [] })),
        axios
          .get(`${API_BASE}/api/admin/analyses/recent`)
          .catch(() => ({ data: [] })),
        axios
          .get(`${API_BASE}/api/admin/metrics/chart`)
          .catch(() => ({ data: [] })),
        axios
          .get(`${API_BASE}/api/admin/metrics/pie`)
          .catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/admin/dataset`).catch(() => ({ data: [] })),
      ]);

      if (statsRes.data && !statsRes.data.detail)
        setStats((prev) => ({ ...prev, ...statsRes.data }));
      if (Array.isArray(usersRes.data)) setUsersList(usersRes.data);
      if (Array.isArray(chartRes.data)) setChartData(chartRes.data);
      if (Array.isArray(pieRes.data)) setPieData(pieRes.data);
      if (Array.isArray(allAnalysesRes.data))
        setAllAnalyses(groupAnalyses(allAnalysesRes.data));
      if (Array.isArray(recentAnalysesRes.data))
        setRecentAnalyses(groupAnalyses(recentAnalysesRes.data).slice(0, 5));
      if (Array.isArray(datasetRes.data)) setDatasetList(datasetRes.data);
    } catch (error) {
      console.error(t("admin.overview.error_load"), error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = usersList.filter(
    (user) =>
      (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedUserIds(filteredUsers.map((u) => u.id));
    else setSelectedUserIds([]);
  };

  const handleSelectOne = (userId) => {
    if (selectedUserIds.includes(userId))
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    else setSelectedUserIds([...selectedUserIds, userId]);
  };

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFormData({ name: "", email: "", role: "user" });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    const roleValue =
      user.role === "admin" || user.role === "Адміністратор" ? "admin" : "user";
    setUserFormData({
      name: user.name || "",
      email: user.email || "",
      role: roleValue,
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(
          `${API_BASE}/api/admin/users/${editingUser.id}`,
          userFormData,
        );
        alert(t("admin.users.save_success", { email: userFormData.email }));
      } else {
        await axios.post(`${API_BASE}/api/admin/users`, userFormData);
        alert(t("admin.users.create_success"));
      }
      setShowUserModal(false);
      fetchRealData();
    } catch (error) {
      alert(error.response?.data?.detail || t("admin.users.save_error"));
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(t("admin.users.delete_confirm", { name: userName }))) {
      try {
        await axios.delete(`${API_BASE}/api/admin/users/${userId}`);
        alert(t("admin.users.delete_success"));
        fetchRealData();
      } catch (error) {
        alert(error.response?.data?.detail || t("admin.users.delete_error"));
      }
    }
  };

  const formatDate = (isoString, includeTime = true) => {
    if (!isoString || isoString === "-") return "-";
    try {
      const d = new Date(isoString.endsWith("Z") ? isoString : isoString + "Z");
      return d.toLocaleDateString(i18n.language === "uk" ? "uk-UA" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
      });
    } catch (e) {
      return String(isoString);
    }
  };

  const getModeBadges = (mode, difficulty) => {
    const isExam = mode === "exam" || mode === "іспит";
    let diffColor =
      difficulty === "easy"
        ? "#10b981"
        : difficulty === "hard"
          ? "#ef4444"
          : "#f59e0b";
    let diffText =
      difficulty === "easy"
        ? t("admin.diff_easy")
        : difficulty === "hard"
          ? t("admin.diff_hard")
          : t("admin.diff_medium");

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          alignItems: "flex-start",
        }}
      >
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "0.65rem",
            fontWeight: "700",
            backgroundColor: isExam
              ? "rgba(239, 68, 68, 0.15)"
              : "rgba(59, 130, 246, 0.15)",
            color: isExam ? "#ef4444" : "#3b82f6",
          }}
        >
          {isExam ? t("admin.mode_exam") : t("admin.mode_practice")}
        </span>
        {!isExam && (
          <span
            style={{
              padding: "3px 10px",
              borderRadius: "6px",
              fontSize: "0.65rem",
              fontWeight: "700",
              border: `1px solid ${diffColor}`,
              color: diffColor,
            }}
          >
            {diffText}
          </span>
        )}
      </div>
    );
  };

  const navItem = (id, iconSvg, label) => (
    <button
      className={`nav-item ${activeTab === id ? "active" : ""}`}
      onClick={() => setActiveTab(id)}
    >
      {iconSvg} {label}
    </button>
  );

  if (loading)
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="admin-layout">
      {/* ================= САЙДБАР ================= */}
      <aside className="admin-sidebar fixed-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z"
              />
            </svg>
          </div>
          <div className="logo-text">
            <h2>{systemName}</h2>
            <span>{t("admin.subtitle")}</span>
          </div>
        </div>

        <nav className="nav-menu">
          <div className="nav-group-label">{t("admin.nav_overview")}</div>
          {navItem(
            "overview",
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>,
            t("admin.tab_overview"),
          )}
          <div className="nav-group-label mt-4">
            {t("admin.nav_management")}
          </div>
          {navItem(
            "users",
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>,
            t("admin.tab_users"),
          )}
          {navItem(
            "analyses",
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>,
            t("admin.tab_analyses"),
          )}
          {navItem(
            "dataset",
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
              />
            </svg>,
            t("admin.tab_dataset"),
          )}
          <div className="nav-group-label mt-4">{t("admin.nav_system")}</div>
          {navItem(
            "settings",
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>,
            t("admin.tab_settings"),
          )}
        </nav>

        <div className="sidebar-footer centered-footer">
          <div className="user-profile-mini vertical-profile">
            <div className="user-avatar-text large-avatar">АП</div>
            <div className="user-info centered-text">
              <span className="user-name">{t("admin.user_admin")}</span>
              <span className="user-role">admin@gmail.com</span>
            </div>
          </div>
          <button className="logout-btn logout-btn-dark" onClick={onLogout}>
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            {t("admin.btn_logout")}
          </button>
        </div>
      </aside>

      <main className="admin-content main-content-pushed">
        {activeTab === "overview" && (
          <div className="admin-page fade-in">
            <div className="page-header">
              <div>
                <h1>{t("admin.overview.title")}</h1>
                <p>{t("admin.overview.desc")}</p>
              </div>
            </div>

            <div className="stats-grid-4">
              <div className="stat-card modern-stat">
                <div className="stat-icon-circle bg-blue text-blue">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-label">
                    {t("admin.overview.stat_users")}
                  </div>
                  <div className="stat-value">
                    {(stats.totalUsers || 0).toLocaleString(
                      i18n.language === "uk" ? "uk-UA" : "en-US",
                    )}
                  </div>
                </div>
              </div>
              <div className="stat-card modern-stat">
                <div className="stat-icon-circle bg-blue text-blue">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-label">
                    {t("admin.overview.stat_scans")}
                  </div>
                  <div className="stat-value">
                    {(stats.totalAnalyses || 0).toLocaleString(
                      i18n.language === "uk" ? "uk-UA" : "en-US",
                    )}
                  </div>
                </div>
              </div>
              <div className="stat-card modern-stat">
                <div className="stat-icon-circle bg-green text-green">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-label">
                    {t("admin.overview.stat_success")}
                  </div>
                  <div className="stat-value">
                    {(stats.avgAccuracy || 0).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="stat-card modern-stat">
                <div className="stat-icon-circle bg-purple text-purple">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-label">
                    {t("admin.overview.stat_iou")}
                  </div>
                  <div className="stat-value">{stats.activeSessions || 0}</div>
                </div>
              </div>
            </div>

            <div className="dashboard-main-grid">
              <div className="panel-card col-span-2">
                <div className="panel-header">
                  <h3>{t("admin.overview.recent_analyses")}</h3>
                  <button
                    className="btn-link"
                    onClick={() => setActiveTab("analyses")}
                  >
                    {t("admin.overview.view_all")} &gt;
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{t("admin.overview.col_datetime")}</th>
                        <th>{t("admin.overview.col_user")}</th>
                        <th>{t("admin.overview.col_mode")}</th>

                        <th>{t("history.table_verdict", "Вердикт аналізу")}</th>
                        <th>{t("admin.overview.col_score")}</th>
                        <th>{t("admin.overview.col_view")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAnalyses.length > 0 ? (
                        recentAnalyses.map((item, idx) => {
                          const score = item.prob || item.score || 0;
                          const missed =
                            item.missed || item.parsedDetails?.missed || 0;
                          const falsePos =
                            item.false_positives ||
                            item.parsedDetails?.false_positives ||
                            0;

                          let verdictElement = (
                            <span style={{ color: "var(--text-muted)" }}>
                              {t("history.verdict_satisfactory", "Задовільно")}
                            </span>
                          );
                          if (item.is_group) {
                            verdictElement =
                              score >= 85 ? (
                                <span
                                  style={{
                                    color: "#22c55e",
                                    fontWeight: "600",
                                  }}
                                >
                                  {t("history.exam_success", "Успішний іспит")}
                                </span>
                              ) : (
                                <span style={{ color: "var(--text-muted)" }}>
                                  {t("history.exam_remarks", "Має зауваження")}
                                </span>
                              );
                          } else if (score >= 85) {
                            verdictElement = (
                              <span
                                style={{ color: "#22c55e", fontWeight: "600" }}
                              >
                                {t("history.verdict_perfect", "Точний аналіз")}
                              </span>
                            );
                          } else if (missed > 0) {
                            verdictElement = (
                              <span
                                style={{ color: "#ef4444", fontWeight: "600" }}
                              >
                                {t(
                                  "history.verdict_missed",
                                  "Пропущено патологію",
                                )}{" "}
                                ({missed})
                              </span>
                            );
                          } else if (falsePos > 0) {
                            verdictElement = (
                              <span
                                style={{ color: "#f97316", fontWeight: "600" }}
                              >
                                {t("history.verdict_hyper", "Гіпердіагностика")}
                              </span>
                            );
                          }

                          return (
                            <tr key={idx}>
                              <td>
                                <div className="cell-main">
                                  {formatDate(item.date)}
                                </div>
                              </td>
                              <td>
                                <div className="cell-main">
                                  {item.userName || t("admin.overview.no_name")}
                                </div>
                                <div className="cell-sub">{item.userEmail}</div>
                              </td>
                              <td>
                                {getModeBadges(item.mode, item.difficulty)}
                              </td>

                              <td>{verdictElement}</td>

                              <td>
                                <div className="cell-main">
                                  {typeof score === "number"
                                    ? score.toFixed(0)
                                    : (parseFloat(score) || 0).toFixed(0)}
                                  %
                                </div>
                                <div className="cell-sub">
                                  {item.iou && item.iou !== "-"
                                    ? `IoU: ${(parseFloat(item.iou) * 100).toFixed(1)}%`
                                    : "-"}
                                </div>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button
                                  className="btn-action-icon text-blue"
                                  onClick={() => setSelectedResult(item)}
                                >
                                  <svg
                                    width="20"
                                    height="20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.321.07.656 0 .964-1.39 4.17-5.325 7.178-9.963 7.178-4.638 0-8.573-3.007-9.963-7.178z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center text-muted"
                            style={{ padding: "20px" }}
                          >
                            {t("admin.overview.no_data")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel-card">
                <div className="panel-header">
                  <h3>{t("admin.overview.diagnosis_distribution")}</h3>
                </div>
                <div className="pie-chart-wrapper">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((e, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={COLORS[idx % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#1e293b",
                          border: "none",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-center-text">
                    <div className="pie-total">
                      {(stats.totalAnalyses || 0).toLocaleString(
                        i18n.language === "uk" ? "uk-UA" : "en-US",
                      )}
                    </div>
                    <div className="pie-label">{t("admin.overview.total")}</div>
                  </div>
                  <div className="pie-legend-custom mt-3">
                    {pieData.map((item, idx) => (
                      <div className="legend-item" key={idx}>
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: COLORS[idx] }}
                        ></span>
                        <div className="legend-text">
                          <span>
                            {item.name === "Пневмонія"
                              ? t("admin.diagnoses.pneumonia")
                              : t("admin.diagnoses.normal")}
                          </span>
                          <span className="legend-val">
                            {(item.value || 0).toLocaleString(
                              i18n.language === "uk" ? "uk-UA" : "en-US",
                            )}{" "}
                            (
                            {(
                              ((item.value || 0) / (stats.totalAnalyses || 1)) *
                              100
                            ).toFixed(1)}
                            %)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analyses" && (
          <div className="admin-page fade-in">
            <div className="page-header">
              <div>
                <h1>{t("admin.analyses.title")}</h1>
                <p>{t("admin.analyses.desc")}</p>
              </div>
            </div>
            <div className="panel-card">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t("admin.analyses.col_datetime")}</th>
                      <th>{t("admin.analyses.col_user")}</th>
                      <th>{t("admin.analyses.col_mode")}</th>
                      <th>{t("history.table_verdict", "Вердикт аналізу")}</th>
                      <th>{t("admin.analyses.col_score")}</th>
                      <th>{t("admin.analyses.col_view")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAnalyses.map((item, idx) => {
                      const score = item.prob || item.score || 0;
                      const missed =
                        item.missed || item.parsedDetails?.missed || 0;
                      const falsePos =
                        item.false_positives ||
                        item.parsedDetails?.false_positives ||
                        0;

                      let verdictElement = (
                        <span style={{ color: "var(--text-muted)" }}>
                          {t("history.verdict_satisfactory", "Задовільно")}
                        </span>
                      );
                      if (item.is_group) {
                        verdictElement =
                          score >= 85 ? (
                            <span
                              style={{ color: "#22c55e", fontWeight: "600" }}
                            >
                              {t("history.exam_success", "Успішний іспит")}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>
                              {t("history.exam_remarks", "Має зауваження")}
                            </span>
                          );
                      } else if (score >= 85) {
                        verdictElement = (
                          <span style={{ color: "#22c55e", fontWeight: "600" }}>
                            {t("history.verdict_perfect", "Точний аналіз")}
                          </span>
                        );
                      } else if (missed > 0) {
                        verdictElement = (
                          <span style={{ color: "#ef4444", fontWeight: "600" }}>
                            {t("history.verdict_missed", "Пропущено патологію")}{" "}
                            ({missed})
                          </span>
                        );
                      } else if (falsePos > 0) {
                        verdictElement = (
                          <span style={{ color: "#f97316", fontWeight: "600" }}>
                            {t("history.verdict_hyper", "Гіпердіагностика")}
                          </span>
                        );
                      }

                      return (
                        <tr key={idx}>
                          <td>
                            <div className="cell-main">
                              {formatDate(item.date || item.created_at)}
                            </div>
                          </td>
                          <td>
                            <div className="cell-main">
                              {item.userName ||
                                item.username ||
                                t("admin.analyses.no_name")}
                            </div>
                            <div className="cell-sub">
                              {item.userEmail || item.email}
                            </div>
                          </td>
                          <td>
                            {getModeBadges(
                              item.mode || item.session_mode,
                              item.difficulty,
                            )}
                          </td>

                          <td>{verdictElement}</td>

                          <td>
                            <div className="cell-main">
                              {typeof score === "number"
                                ? score.toFixed(0)
                                : (parseFloat(score) || 0).toFixed(0)}
                              %
                            </div>
                            <div className="cell-sub">
                              {item.iou
                                ? `IoU: ${(parseFloat(item.iou) * 100).toFixed(1)}%`
                                : "-"}
                            </div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              className="btn-action-icon text-blue"
                              onClick={() => setSelectedResult(item)}
                            >
                              <svg
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.321.07.656 0 .964-1.39 4.17-5.325 7.178-9.963 7.178-4.638 0-8.573-3.007-9.963-7.178z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === "users" && (
          <div className="admin-page fade-in">
            <div className="page-header" style={{ alignItems: "center" }}>
              <div>
                <h1>{t("admin.users.title")}</h1>
                <p className="text-muted">{t("admin.users.desc")}</p>
              </div>
              <button
                className="btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
                onClick={handleOpenAddUser}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  ></path>
                </svg>
                {t("admin.users.btn_add")}
              </button>
            </div>
            <div className="search-bar-container">
              <input
                type="text"
                placeholder={t("admin.users.search_placeholder")}
                className="search-input-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="panel-card users-table-card">
              <div className="table-responsive">
                <table className="admin-table users-table">
                  <thead>
                    <tr>
                      <th style={{ width: "50px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={
                            filteredUsers.length > 0 &&
                            selectedUserIds.length === filteredUsers.length
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>{t("admin.users.col_user")}</th>
                      <th>{t("admin.users.col_role")}</th>
                      <th>{t("admin.users.col_reg")}</th>
                      <th>{t("admin.users.col_analyses")}</th>
                      <th>{t("admin.users.col_score")}</th>
                      <th style={{ textAlign: "right", paddingRight: "24px" }}>
                        {t("admin.users.col_actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td style={{ textAlign: "center" }}>
                            <input
                              type="checkbox"
                              className="custom-checkbox"
                              checked={selectedUserIds.includes(u.id)}
                              onChange={() => handleSelectOne(u.id)}
                            />
                          </td>
                          <td>
                            <div className="user-cell-flex">
                              <div className="user-avatar-small">
                                {u.name?.charAt(0) || "U"}
                              </div>
                              <div>
                                <div className="user-name-bold">
                                  {u.name || t("admin.users.no_name")}
                                </div>
                                <div className="cell-sub">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {u.role === "admin"
                              ? t("admin.users.role_admin")
                              : t("admin.users.role_user")}
                          </td>
                          <td className="text-muted">
                            {formatDate(u.reg_date, false)}
                          </td>
                          <td>{u.scans || 0}</td>
                          <td>
                            <strong>{u.score || 0}%</strong>
                          </td>
                          <td
                            style={{ textAlign: "right", paddingRight: "24px" }}
                          >
                            <button
                              className="btn-action-icon"
                              title={t("admin.users.btn_edit")}
                              onClick={() => handleOpenEditUser(u)}
                            >
                              <svg
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.14l-2.81.936c-.47.156-.904-.276-.748-.748l.936-2.81a4.5 4.5 0 011.14-1.89l13.402-13.402z"
                                ></path>
                              </svg>
                            </button>
                            <button
                              className="btn-action-icon text-danger"
                              title={t("admin.users.btn_delete")}
                              onClick={() =>
                                handleDeleteUser(u.id, u.name || u.email)
                              }
                            >
                              <svg
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                ></path>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center text-muted"
                          style={{ padding: "20px" }}
                        >
                          {t("admin.users.no_users")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "dataset" &&
          (() => {
            const totalImages = datasetList.length;
            let pneumoCount = 0;

            datasetList.forEach((img) => {
              const boxesArray = extractArray(img.boxes);
              if (boxesArray.length > 0) {
                pneumoCount++;
              }
            });

            const normalCount = totalImages - pneumoCount;
            const visibleImages = datasetList.slice(0, datasetViewLimit);

            return (
              <div className="admin-page fade-in">
                <div
                  className="page-header"
                  style={{ alignItems: "center", marginBottom: "30px" }}
                >
                  <div>
                    <h1
                      style={{
                        fontSize: "28px",
                        color: "#fff",
                        marginBottom: "5px",
                      }}
                    >
                      {t("admin.dataset.title")}
                    </h1>
                    <p style={{ color: "var(--text-muted)", margin: 0 }}>
                      {t("admin.dataset.desc")}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "20px",
                    marginBottom: "20px",
                  }}
                >
                  <div className="panel-card" style={{ padding: "20px" }}>
                    <div
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                        marginBottom: "10px",
                      }}
                    >
                      {t("admin.dataset.stat_images")}
                    </div>
                    <div
                      style={{
                        color: "#fff",
                        fontSize: "28px",
                        fontWeight: "600",
                      }}
                    >
                      {totalImages.toLocaleString(
                        i18n.language === "uk" ? "uk-UA" : "en-US",
                      )}
                    </div>
                  </div>
                  <div className="panel-card" style={{ padding: "20px" }}>
                    <div
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                        marginBottom: "10px",
                      }}
                    >
                      {t("admin.dataset.stat_labeled")}
                    </div>
                    <div
                      style={{
                        color: "#fff",
                        fontSize: "28px",
                        fontWeight: "600",
                      }}
                    >
                      {totalImages.toLocaleString(
                        i18n.language === "uk" ? "uk-UA" : "en-US",
                      )}{" "}
                      <span
                        style={{
                          fontSize: "14px",
                          color: "var(--text-muted)",
                          fontWeight: "normal",
                        }}
                      >
                        (100%)
                      </span>
                    </div>
                  </div>
                  <div className="panel-card" style={{ padding: "20px" }}>
                    <div
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                        marginBottom: "10px",
                      }}
                    >
                      {t("admin.dataset.stat_classes")}
                    </div>
                    <div
                      style={{
                        color: "#fff",
                        fontSize: "28px",
                        fontWeight: "600",
                      }}
                    >
                      2
                    </div>
                  </div>
                  <div className="panel-card" style={{ padding: "20px" }}>
                    <div
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                        marginBottom: "10px",
                      }}
                    >
                      {t("admin.dataset.stat_version")}
                    </div>
                    <div
                      style={{
                        color: "#fff",
                        fontSize: "28px",
                        fontWeight: "600",
                      }}
                    >
                      v1.0.0
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2.5fr",
                    gap: "20px",
                  }}
                >
                  <div
                    className="panel-card"
                    style={{ padding: "24px", alignSelf: "start" }}
                  >
                    <h3
                      style={{
                        color: "#fff",
                        fontSize: "1.1rem",
                        marginBottom: "25px",
                        border: "none",
                      }}
                    >
                      {t("admin.dataset.classes")}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        marginBottom: "25px",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "3px",
                          backgroundColor: "#ef4444",
                          marginTop: "4px",
                        }}
                      ></div>
                      <div>
                        <div
                          style={{
                            color: "#fff",
                            fontWeight: "500",
                            marginBottom: "4px",
                          }}
                        >
                          {t("admin.dataset.class_pneumonia")}
                        </div>
                        <div
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {pneumoCount.toLocaleString(
                            i18n.language === "uk" ? "uk-UA" : "en-US",
                          )}{" "}
                          {t("admin.dataset.class_images")}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "3px",
                          backgroundColor: "#10b981",
                          marginTop: "4px",
                        }}
                      ></div>
                      <div>
                        <div
                          style={{
                            color: "#fff",
                            fontWeight: "500",
                            marginBottom: "4px",
                          }}
                        >
                          {t("admin.dataset.class_normal")}
                        </div>
                        <div
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {normalCount.toLocaleString(
                            i18n.language === "uk" ? "uk-UA" : "en-US",
                          )}{" "}
                          {t("admin.dataset.class_images")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="panel-card" style={{ padding: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                      }}
                    >
                      <h3
                        style={{
                          color: "#fff",
                          fontSize: "1.1rem",
                          margin: 0,
                          border: "none",
                        }}
                      >
                        {t("admin.dataset.images_in_dataset")}
                      </h3>

                      {datasetViewLimit < totalImages ? (
                        <button
                          onClick={() => setDatasetViewLimit(totalImages)}
                          style={{
                            background: "transparent",
                            border: "1px solid var(--border-color)",
                            color: "var(--text-muted)",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            transition: "0.2s",
                          }}
                          onMouseOver={(e) => (e.target.style.color = "#fff")}
                          onMouseOut={(e) =>
                            (e.target.style.color = "var(--text-muted)")
                          }
                        >
                          {t("admin.dataset.btn_all")}
                        </button>
                      ) : (
                        <button
                          onClick={() => setDatasetViewLimit(6)}
                          style={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-color)",
                            color: "#fff",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            transition: "0.2s",
                          }}
                          onMouseOver={(e) =>
                            (e.target.style.color = "#ef4444")
                          }
                          onMouseOut={(e) => (e.target.style.color = "#fff")}
                        >
                          {t("admin.dataset.btn_hide")}
                        </button>
                      )}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "15px",
                        alignContent: "start",
                        maxHeight: datasetViewLimit > 6 ? "550px" : "auto",
                        overflowY: datasetViewLimit > 6 ? "auto" : "visible",
                        paddingRight: datasetViewLimit > 6 ? "10px" : "0",
                      }}
                    >
                      {visibleImages.length > 0 ? (
                        visibleImages.map((img, idx) => (
                          <div
                            key={idx}
                            style={{
                              height: "160px",
                              borderRadius: "10px",
                              overflow: "hidden",
                              backgroundColor: "#0f172a",
                              border: "1px solid var(--border-color)",
                              position: "relative",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              setSelectedResult({
                                is_dataset_preview: true,
                                img: img,
                              })
                            }
                          >
                            <img
                              src={`${AWS_S3_BASE_URL}${img.image_name}`}
                              alt="X-Ray"
                              loading="lazy"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                opacity: "0.8",
                                transition: "opacity 0.2s",
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.opacity = "1")
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.opacity = "0.8")
                              }
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: "8px",
                                background:
                                  "linear-gradient(transparent, rgba(0,0,0,0.8))",
                                color: "#fff",
                                fontSize: "0.75rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {img.image_name}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            gridColumn: "span 3",
                            textAlign: "center",
                            color: "var(--text-muted)",
                            padding: "40px",
                          }}
                        >
                          {t("admin.dataset.no_images")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        {activeTab === "settings" && (
          <div className="admin-page fade-in">
            <div className="page-header">
              <div>
                <h1>{t("admin.settings.title")}</h1>
                <p className="text-muted">{t("admin.settings.desc")}</p>
              </div>
            </div>

            <div
              className="settings-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <div className="panel-card" style={{ padding: "24px" }}>
                  <h3
                    style={{
                      color: "var(--text-main)",
                      fontSize: "1.1rem",
                      marginBottom: "20px",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h10a7 7 0 00-7-7z" />
                    </svg>
                    {t("admin.settings.personal_data")}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {t("admin.settings.display_name")}
                      </label>
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="search-input-full"
                        style={{ marginTop: "5px" }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        value="admin@gmail.com"
                        disabled
                        className="search-input-full"
                        style={{
                          marginTop: "5px",
                          opacity: 0.6,
                          cursor: "not-allowed",
                        }}
                      />
                    </div>
                    <button
                      className="btn-primary"
                      style={{ marginTop: "10px" }}
                      onClick={() => alert(t("admin.settings.profile_updated"))}
                    >
                      {t("admin.settings.btn_save")}
                    </button>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <div className="panel-card" style={{ padding: "24px" }}>
                  <h3
                    style={{
                      color: "var(--text-main)",
                      fontSize: "1.1rem",
                      marginBottom: "20px",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                    {t("admin.settings.interface")}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {t("admin.settings.platform_name")}
                      </label>
                      <input
                        type="text"
                        value={tempPlatformName}
                        onChange={(e) => setTempPlatformName(e.target.value)}
                        className="search-input-full"
                        style={{ marginTop: "5px" }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.95rem",
                          color: "var(--text-main)",
                        }}
                      >
                        {t("admin.settings.language")}
                      </span>
                      <select
                        value={i18n.language}
                        onChange={handleLanguageChange}
                        className="custom-select"
                        style={{
                          background: "var(--bg-page)",
                          color: "var(--text-main)",
                          border: "1px solid var(--border-color)",
                          padding: "5px 10px",
                          borderRadius: "6px",
                        }}
                      >
                        <option value="uk">Українська</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <button
                      className="btn-primary"
                      style={{ marginTop: "10px" }}
                      onClick={() => {
                        setPlatformName(tempPlatformName);
                        alert("Зміни успішно застосовано!");
                      }}
                    >
                      Застосувати зміни
                    </button>

                    <hr
                      style={{
                        border: "none",
                        borderTop: "1px solid var(--border-color)",
                        margin: "5px 0",
                      }}
                    />

                    <button
                      onClick={onLogout}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid var(--accent-red)",
                        background: "rgba(239, 68, 68, 0.05)",
                        color: "var(--accent-red)",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {t("admin.settings.btn_logout")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= МОДАЛКИ ================= */}
      {selectedResult && (
        <div className="modal-overlay" onClick={() => setSelectedResult(null)}>
          <div
            className="modal-content result-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {selectedResult.is_dataset_preview
                  ? `${t("admin.modal.reference")}: ${selectedResult.img.image_name}`
                  : selectedResult.is_group
                    ? t("admin.modal.exam_review")
                    : t("admin.modal.practice_review")}
              </h2>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedResult(null)}
                style={{
                  background: "transparent",
                  border: "none",
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
            </div>

            <div className="modal-body scrollable">
              {selectedResult.is_dataset_preview ? (
                <div style={{ textAlign: "center" }}>
                  <img
                    src={`${AWS_S3_BASE_URL}${selectedResult.img.image_name}`}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                    }}
                  />
                  <div
                    style={{
                      marginTop: "15px",
                      color: "var(--text-muted)",
                      fontSize: "0.9rem",
                      textAlign: "left",
                      backgroundColor: "var(--bg-card)",
                      padding: "15px",
                      borderRadius: "8px",
                    }}
                  >
                    <strong style={{ color: "#fff" }}>
                      {t("admin.modal.focal_coordinates")}
                    </strong>
                    <br />
                    {typeof selectedResult.img.boxes === "string"
                      ? selectedResult.img.boxes
                      : JSON.stringify(selectedResult.img.boxes)}
                  </div>
                </div>
              ) : selectedResult.is_group ? (
                <>
                  <div className="info-summary-card">
                    <div className="info-block">
                      <label>{t("admin.modal.images_count")}</label>
                      <span>{selectedResult.items.length} шт.</span>
                    </div>
                    <div className="info-block">
                      <label>{t("admin.modal.user")}</label>
                      <span>{selectedResult.userEmail}</span>
                    </div>
                    <div className="info-block">
                      <label>{t("admin.modal.average_score")}</label>
                      <span className="text-highlight">
                        {selectedResult.prob}%
                      </span>
                    </div>
                  </div>
                  <div className="exam-accordion-list">
                    {selectedResult.items.map((item, i) => (
                      <details key={i} className="exam-details-item">
                        <summary>
                          <span className="summary-title">
                            {t("admin.modal.image")} {i + 1}
                          </span>
                          <strong
                            className={
                              item.prob > 70 ? "text-success" : "text-danger"
                            }
                          >
                            {item.prob}%
                          </strong>
                        </summary>
                        <div className="summary-content">
                          <ResultCanvas
                            imageUrl={`${AWS_S3_BASE_URL}${item.image_id}`}
                            userBoxes={item.student_boxes || []}
                            gtBoxes={item.ground_truth_boxes || []}
                          />
                        </div>
                      </details>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="info-summary-card"
                    style={{ marginBottom: "20px" }}
                  >
                    <div className="info-block">
                      <label>{t("admin.modal.user")}</label>
                      <span>{selectedResult.userEmail}</span>
                    </div>
                    <div className="info-block">
                      <label>{t("admin.modal.difficulty")}</label>
                      <span>{selectedResult.difficulty}</span>
                    </div>
                    <div className="info-block">
                      <label>{t("admin.modal.iou_accuracy")}</label>
                      <span className="text-highlight">
                        {selectedResult.iou || "N/A"}
                      </span>
                    </div>
                  </div>
                  <ResultCanvas
                    imageUrl={
                      selectedResult.imageUrl ||
                      selectedResult.image_url ||
                      `${AWS_S3_BASE_URL}${selectedResult.image_id}`
                    }
                    userBoxes={selectedResult.student_boxes || []}
                    gtBoxes={selectedResult.ground_truth_boxes || []}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА ДОДАВАННЯ КОРИСТУВАЧА */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div
            className="modal-content result-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px" }}
          >
            <div className="modal-header">
              <h2>
                {editingUser
                  ? t("admin.modal.edit_user")
                  : t("admin.modal.new_user")}
              </h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowUserModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
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
            </div>
            <div className="modal-body">
              <form
                onSubmit={handleSaveUser}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <label
                    style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                  >
                    {t("admin.modal.full_name")}
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.name}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, name: e.target.value })
                    }
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-card)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <label
                    style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        email: e.target.value,
                      })
                    }
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-card)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <label
                    style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                  >
                    {t("admin.modal.role")}
                  </label>
                  <select
                    value={userFormData.role}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, role: e.target.value })
                    }
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-card)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="user">{t("admin.modal.role_user")}</option>
                    <option value="admin">{t("admin.modal.role_admin")}</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  {editingUser
                    ? t("admin.modal.btn_save_changes")
                    : t("admin.modal.btn_create")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
