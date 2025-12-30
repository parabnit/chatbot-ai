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
        </div>
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
    backgroundColor: "#f8fafc",
    backgroundImage: `
      radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.15) 0px, transparent 50%)
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
    filter: "drop-shadow(0 0 10px rgba(0,0,0,0.15))",
    animation: "pulseEmoji 3s ease-in-out infinite",
  },

  title: {
    fontSize: "3rem",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-0.04em",
    background: "linear-gradient(135deg, #2563eb, #7c3aed, #db2777)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  subtitle: {
    color: "#475569",
    fontSize: "1.2rem",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: "1.6",
  },

  mainContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "30px",
    width: "100%",
    maxWidth: "1400px",
    flex: 1,
    zIndex: 5,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "50px",
  },

  sidebar: {
    flex: "1",
    minWidth: "380px",
    maxWidth: "450px",
    height: "fit-content",
  },

  chatSection: {
    flex: "2",
    minWidth: "550px",
    height: "750px",
  },

  glassCard: {
    background: "rgba(255, 255, 255, 0.75)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderRadius: "30px",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    padding: "30px",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.12)",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },

  glassCardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 35px 60px rgba(0, 0, 0, 0.18)",
  },

  cardHeader: {
    marginBottom: "25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardTitle: {
    color: "#0f172a",
    fontSize: "1.4rem",
    fontWeight: "700",
    margin: 0,
  },

  statusIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.75rem",
    color: "#334155",
    background: "rgba(0,0,0,0.05)",
    padding: "6px 12px",
    borderRadius: "20px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    animation: "fadeIn 1.5s ease",
  },

  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
    animation: "pulseDot 2s infinite",
  },

  blob1: {
    position: "absolute",
    top: "-10%",
    left: "-10%",
    width: "550px",
    height: "550px",
    background: "rgba(59, 130, 246, 0.18)",
    filter: "blur(140px)",
    borderRadius: "50%",
    zIndex: 0,
    animation: "moveBlob1 30s linear infinite alternate",
  },

  blob2: {
    position: "absolute",
    bottom: "-10%",
    right: "-5%",
    width: "450px",
    height: "450px",
    background: "rgba(168, 85, 247, 0.16)",
    filter: "blur(120px)",
    borderRadius: "50%",
    zIndex: 0,
    animation: "moveBlob2 40s linear infinite alternate",
  },

  blob3: {
    position: "absolute",
    top: "35%",
    left: "45%",
    width: "350px",
    height: "350px",
    background: "rgba(236, 72, 153, 0.12)",
    filter: "blur(100px)",
    borderRadius: "50%",
    zIndex: 0,
    animation: "moveBlob3 35s linear infinite alternate",
  },

  footer: {
    textAlign: "center",
    padding: "25px",
    color: "#64748b",
    fontSize: "0.85rem",
    borderTop: "1px solid rgba(0, 0, 0, 0.08)",
    width: "100%",
    position: "relative",
    zIndex: 10,
  },
};



export default App;