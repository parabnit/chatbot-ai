import { useEffect, useRef, useState } from "react";

export default function ChatPanel({ hasKnowledge }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const askQuestion = async () => {
    if (!hasKnowledge || !question.trim() || loading) return;

    const userMsg = { role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Server is offline. Check Ollama status." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Info */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>💬 Live Session</span>
        {!hasKnowledge && (
          <span style={styles.warningTag}>Action Required: Upload PDF</span>
        )}
      </div>

      {/* Chat History Area */}
      <div style={styles.chatWindow}>
        {messages.length === 0 && !loading && (
          <div style={styles.emptyState}>
            {hasKnowledge ? "Knowledge Base Connected. Ask me anything!" : "System waiting for data input..."}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: "16px",
            }}
          >
            <div style={msg.role === "user" ? styles.userBubble : styles.aiBubble}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
            <div style={styles.aiBubble}>
              <span className="typing-dots">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={styles.inputContainer}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={hasKnowledge ? "Type your message..." : "Waiting for document..."}
          disabled={!hasKnowledge || loading}
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && askQuestion()}
        />

        <button
          onClick={askQuestion}
          disabled={!hasKnowledge || loading}
          style={{
            ...styles.sendButton,
            background: hasKnowledge ? "#10b981" : "#475569",
            cursor: hasKnowledge && !loading ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%", // This fills the glass card from App.js
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  headerTitle: {
    color: "#fff",
    fontSize: "0.9rem",
    fontWeight: "600",
    opacity: 0.8,
  },
  warningTag: {
    fontSize: "0.7rem",
    color: "#f59e0b",
    background: "rgba(245, 158, 11, 0.1)",
    padding: "4px 8px",
    borderRadius: "6px",
    border: "1px solid rgba(245, 158, 11, 0.2)",
  },
  chatWindow: {
    flex: 1,
    overflowY: "auto",
    paddingRight: "10px",
    paddingBottom: "10px",
    display: "flex",
    flexDirection: "column",
  },
  emptyState: {
    textAlign: "center",
    color: "#64748b",
    marginTop: "auto",
    marginBottom: "auto",
    fontSize: "0.9rem",
    fontStyle: "italic",
  },
  userBubble: {
    maxWidth: "80%",
    padding: "12px 18px",
    borderRadius: "20px 20px 4px 20px",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "#fff",
    fontSize: "0.95rem",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  aiBubble: {
    maxWidth: "80%",
    padding: "12px 18px",
    borderRadius: "20px 20px 20px 4px",
    background: "rgba(255, 255, 255, 0.08)", // Grey/translucent effect
    backdropFilter: "blur(4px)",
    color: "#e2e8f0",
    fontSize: "0.95rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    lineHeight: "1.5",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
    paddingTop: "15px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  input: {
    flex: 1,
    padding: "12px 18px",
    borderRadius: "14px",
    background: "rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#fff",
    fontSize: "0.95rem",
    outline: "none",
  },
  sendButton: {
    padding: "0 24px",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    fontWeight: "700",
    transition: "all 0.2s ease",
  },
};