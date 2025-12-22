import React, { useState } from "react";
import axios from "axios";

function KnowledgePanel({ setHasKnowledge }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadPDF = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:3001/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setHasKnowledge(true);
      setMessage(`✅ Success: ${res.data.chunks || "all"} chunks stored.`);
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Upload failed. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Upload Zone */}
      <div 
        style={{
          ...styles.dropZone,
          borderColor: file ? "#10b981" : "rgba(255, 255, 255, 0.2)",
          background: file ? "rgba(16, 185, 129, 0.05)" : "transparent"
        }}
      >
        <span style={styles.icon}>{file ? "✅" : "📄"}</span>
        <p style={styles.dropText}>
          {file ? file.name : "Select your PDF document"}
        </p>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setMessage("");
          }}
          style={styles.hiddenInput}
          id="pdf-upload"
        />
        <label htmlFor="pdf-upload" style={styles.browseLabel}>
          {file ? "Change File" : "Browse Files"}
        </label>
      </div>

      <button
        onClick={uploadPDF}
        disabled={loading || !file}
        style={{
          ...styles.uploadBtn,
          opacity: (loading || !file) ? 0.6 : 1,
          cursor: (loading || !file) ? "not-allowed" : "pointer"
        }}
      >
        {loading ? (
          <span style={styles.loader}>Processing...</span>
        ) : (
          "Train AI on PDF"
        )}
      </button>

      {message && (
        <div style={{
          ...styles.messageBox,
          backgroundColor: message.includes("Success") ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
          color: message.includes("Success") ? "#34d399" : "#f87171"
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
  },

  dropZone: {
    border: "2px dashed rgba(148, 163, 184, 0.35)",
    borderRadius: "18px",
    padding: "36px 24px",
    textAlign: "center",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(10px)",
    cursor: "pointer",
  },

  dropZoneHover: {
    borderColor: "#818cf8",
    background: "rgba(30, 41, 59, 0.8)",
    transform: "scale(1.01)",
  },

  icon: {
    fontSize: "2.2rem",
    color: "#818cf8",
    marginBottom: "6px",
  },

  dropText: {
    color: "#e5e7eb",
    fontSize: "0.95rem",
    margin: 0,
    wordBreak: "break-word",
    lineHeight: "1.4",
  },

  subText: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },

  hiddenInput: {
    display: "none",
  },

  browseLabel: {
    fontSize: "0.85rem",
    color: "#60a5fa",
    cursor: "pointer",
    textDecoration: "underline",
    fontWeight: "600",
  },

  uploadBtn: {
    padding: "14px 18px",
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "1rem",
    boxShadow: "0 12px 25px -8px rgba(139, 92, 246, 0.45)",
    transition: "all 0.25s ease",
    cursor: "pointer",
  },

  uploadBtnHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 18px 30px -8px rgba(139, 92, 246, 0.6)",
  },

  uploadBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  messageBox: {
    padding: "14px",
    borderRadius: "12px",
    fontSize: "0.85rem",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(15, 23, 42, 0.7)",
    color: "#e5e7eb",
  },

  loader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontSize: "0.9rem",
    color: "#c7d2fe",
  },
};


export default KnowledgePanel;