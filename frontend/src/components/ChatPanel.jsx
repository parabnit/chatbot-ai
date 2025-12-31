import { useEffect, useRef, useState } from "react";

export default function ChatPanel({ hasKnowledge }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Highlight keywords dynamically
  const highlightText = (text) => {
    const keywords = ["important", "note", "warning", "required", "must"];
    let highlighted = text;

    keywords.forEach((word) => {
      const regex = new RegExp(`(${word})`, "gi");
      highlighted = highlighted.replace(
        regex,
        `<span style="color:#38bdf8;font-weight:700;text-shadow:0 0 8px rgba(56,189,248,0.6)">$1</span>`
      );
    });

    return highlighted;
  };

  // Typing Indicator Component
  const TypingIndicator = () => (
    <div style={styles.typingDots}>
      <span style={{ ...styles.dot, animationDelay: "0s" }}></span>
      <span style={{ ...styles.dot, animationDelay: "0.2s" }}></span>
      <span style={{ ...styles.dot, animationDelay: "0.4s" }}></span>
    </div>
  );

  const askQuestion = async () => {
    if (!question.trim() || loading) return;


    const userText = question;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setQuestion("");
    setLoading(true);

    // Show typing indicator as a separate message
    setMessages((prev) => [...prev, { role: "assistant", text: "typing" }]);

    try {
      const res = await fetch("http://localhost:3001/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userText }),
      });

      const data = await res.json();
      const answerText = data.answer;

      setMessages((prev) => {
        const updated = [...prev];
        // Replace the typing message with the actual answer
        const index = updated.findIndex((m) => m.text === "typing");
        if (index !== -1) {
          updated[index] = { role: "assistant", text: answerText };
        }
        return updated;
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((m) => m.text === "typing");
        if (index !== -1) {
          updated[index] = {
            role: "assistant",
            text: "⚠️ Ollama server not responding.",
          };
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>💬 Live Session</span>
        {!hasKnowledge && (
          <span style={styles.warningTag}>Upload PDF to Start</span>
        )}
      </div>

      <div style={styles.chatWindow}>
        {messages.length === 0 && !loading && (
          <div style={styles.emptyState}>
            {hasKnowledge
              ? "Knowledge Base Connected. Ask me anything!"
              : "Waiting for documents..."}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent:
                msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                ...(msg.role === "user"
                  ? styles.userBubble
                  : styles.aiBubble),
              }}
            >
              {msg.role === "assistant" && msg.text === "typing" ? (
                <TypingIndicator />
              ) : msg.role === "assistant" ? (
                <span
                  dangerouslySetInnerHTML={{ __html: highlightText(msg.text) }}
                />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div style={styles.inputContainer}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={
            hasKnowledge ? "Ask something..." : "Waiting for document..."
          }
          disabled={loading}
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && askQuestion()}
        />

        <button
          onClick={askQuestion}
          disabled={loading}
          style={{
            ...styles.sendButton,
            background: hasKnowledge ? "#10b981" : "#475569",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {/* Animations */}
      <style>
        {`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}
      </style>
    </div>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "linear-gradient(180deg,#ffffff,#f1f5f9)",
    borderRadius: "18px",
    padding: "16px",
    border: "1px solid rgba(0,0,0,0.08)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },

  headerTitle: {
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "1rem",
    letterSpacing: "0.3px",
  },

  warningTag: {
    color: "#92400e",
    fontSize: "0.7rem",
    padding: "4px 10px",
    border: "1px solid rgba(251,191,36,0.5)",
    borderRadius: "999px",
    background: "rgba(251,191,36,0.15)",
  },

  chatWindow: {
    flex: 1,
    overflowY: "auto",
    padding: "10px 6px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  emptyState: {
    color: "#64748b",
    textAlign: "center",
    marginTop: "45%",
    fontStyle: "italic",
    fontSize: "0.85rem",
  },

  userBubble: {
    alignSelf: "flex-end",
    background: "linear-gradient(135deg,#2563eb,#60a5fa)",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: "18px 18px 4px 18px",
    maxWidth: "75%",
    fontSize: "0.9rem",
    lineHeight: "1.4",
    boxShadow: "0 8px 18px rgba(37,99,235,0.25)",
  },

  aiBubble: {
    alignSelf: "flex-start",
    background: "rgba(255,255,255,0.9)",
    color: "#0f172a",
    padding: "12px 16px",
    borderRadius: "18px 18px 18px 4px",
    maxWidth: "75%",
    fontSize: "0.9rem",
    lineHeight: "1.4",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
  },

  inputContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
  },

  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#0f172a",
    border: "1px solid rgba(15,23,42,0.2)",
    outline: "none",
    fontSize: "0.9rem",
  },

  sendButton: {
    padding: "0 22px",
    color: "#ffffff",
    borderRadius: "14px",
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    boxShadow: "0 6px 16px rgba(34,197,94,0.25)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },

  typingDots: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    height: "18px",
    padding: "4px 0",
  },

  dot: {
    width: "6px",
    height: "6px",
    backgroundColor: "#38bdf8",
    borderRadius: "50%",
    display: "inline-block",
    animation: "bounce 1s infinite ease-in-out",
  },
};
