import React, { useState } from "react";
import KnowledgePanel from "./components/KnowledgePanel";
import ChatPanel from "./components/ChatPanel";

function App() {
  const [hasKnowledge, setHasKnowledge] = useState(false);

  return (
    <div style={styles.pageWrapper}>
      {/* Enhanced Animated-style Background Blobs */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>
      <div style={styles.blob3}></div>

      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <span style={styles.emoji}>📚</span>
          <h1 style={styles.title}>
            Knowledge<span style={styles.titleAccent}>Chat</span>
          </h1>
        </div>
        <p style={styles.subtitle}>
          Harness the power of local AI to interrogate your PDF documents securely.
        </p>
      </header>

      <main style={styles.mainContainer}>
        {/* Left Column: Knowledge Base Control */}
        <section style={styles.sidebar}>
          <div style={styles.glassCard}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Source Documents</h2>
              <div style={styles.statusIndicator}>
                <span style={{ 
                  ...styles.dot, 
                  backgroundColor: hasKnowledge ? '#10b981' : '#f59e0b',
                  boxShadow: hasKnowledge ? '0 0 10px #10b981' : '0 0 10px #f59e0b'
                }}></span>
                {hasKnowledge ? "Indexed & Ready" : "System Offline"}
              </div>
            </div>
            <KnowledgePanel setHasKnowledge={setHasKnowledge} />
          </div>
        </section>

        {/* Right Column: Chat Interface */}
        <section style={styles.chatSection}>
          <div style={{ ...styles.glassCard, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ChatPanel hasKnowledge={hasKnowledge} />
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>Built with Neural Precision • 2025 • Powered by Ollama</p>
      </footer>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100vw",
    backgroundColor: "#0f172a", // Deep slate base
    backgroundImage: `
      radial-gradient(at 0% 0%, rgba(30, 58, 138, 0.5) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(88, 28, 135, 0.5) 0px, transparent 50%)
    `,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    padding: "20px",
    position: "relative",
    overflowX: "hidden",
  },
  header: {
    textAlign: "center",
    margin: "40px 0 50px 0",
    zIndex: 10,
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "10px",
  },
  emoji: {
    fontSize: "3rem",
    filter: "drop-shadow(0 0 15px rgba(255,255,255,0.3))",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: "-0.04em",
    margin: 0,
  },
  titleAccent: {
    background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "1.1rem",
    maxWidth: "500px",
    margin: "0 auto",
    lineHeight: "1.6",
  },
  mainContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "25px",
    width: "100%",
    maxWidth: "1300px",
    flex: 1,
    zIndex: 5,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "40px",
  },
  sidebar: {
    flex: "1",
    minWidth: "350px",
    maxWidth: "450px",
    height: "fit-content",
  },
  chatSection: {
    flex: "2",
    minWidth: "500px",
    height: "700px", // Fixed height for a substantial chat feel
  },
  glassCard: {
    background: "rgba(30, 41, 59, 0.7)", // Slightly darker for better text contrast
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: "28px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "30px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    marginBottom: "25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    color: "#f1f5f9",
    fontSize: "1.25rem",
    fontWeight: "700",
    margin: 0,
  },
  statusIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.75rem",
    color: "#cbd5e1",
    background: "rgba(0,0,0,0.2)",
    padding: "6px 12px",
    borderRadius: "20px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  blob1: {
    position: "absolute",
    top: "10%",
    left: "-5%",
    width: "500px",
    height: "500px",
    background: "rgba(59, 130, 246, 0.15)",
    filter: "blur(120px)",
    borderRadius: "50%",
    zIndex: 1,
  },
  blob2: {
    position: "absolute",
    bottom: "10%",
    right: "-5%",
    width: "400px",
    height: "400px",
    background: "rgba(139, 92, 246, 0.15)",
    filter: "blur(100px)",
    borderRadius: "50%",
    zIndex: 1,
  },
  blob3: {
    position: "absolute",
    top: "40%",
    left: "40%",
    width: "300px",
    height: "300px",
    background: "rgba(236, 72, 153, 0.05)",
    filter: "blur(80px)",
    borderRadius: "50%",
    zIndex: 1,
  },
  footer: {
    textAlign: "center",
    padding: "20px",
    color: "#64748b",
    fontSize: "0.85rem",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    width: "100%",
  }
};

export default App;