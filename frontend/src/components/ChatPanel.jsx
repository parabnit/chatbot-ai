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

  const askQuestion = async () => {
    if (!hasKnowledge || !question.trim() || loading) return;

    const userText = question;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setQuestion("");
    setLoading(true);

    // placeholder AI bubble
    setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

    try {
      const res = await fetch("http://localhost:3001/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userText }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulated = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          accumulated += decoder
            .decode(value, { stream: true })
            .replace(/\n/g, "<br/>");

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              text: accumulated,
            };
            return updated;
          });
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Ollama server not responding." },
      ]);
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
              className={
                msg.role === "assistant" &&
                loading &&
                i === messages.length - 1
                  ? "streaming"
                  : ""
              }
              style={{
                ...(msg.role === "user"
                  ? styles.userBubble
                  : styles.aiBubble),
              }}
            >
              {msg.role === "assistant" ? (
                <span
                  className={
                    loading && i === messages.length - 1 ? "stream" : ""
                  }
                  dangerouslySetInnerHTML={{
                    __html:
                      highlightText(msg.text) +
                      (loading && i === messages.length - 1
                        ? `<span class="cursor">▍</span>`
                        : ""),
                  }}
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
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {/* Streaming + Cursor Animations */}
      <style>
        {`
        .cursor {
          display: inline-block;
          margin-left: 2px;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%,50% { opacity:1 }
          51%,100% { opacity:0 }
        }

        .stream {
          animation: streamIn 0.12s ease-out;
        }

        @keyframes streamIn {
          from {
            opacity: 0.4;
            transform: translateY(1px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .streaming {
          animation: pulseGlow 1.2s infinite;
        }

        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 rgba(56,189,248,0.0); }
          50% { box-shadow: 0 0 14px rgba(56,189,248,0.18); }
          100% { box-shadow: 0 0 0 rgba(56,189,248,0.0); }
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
    background: "linear-gradient(180deg,#0f172a,#020617)",
    borderRadius: "18px",
    padding: "16px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },

  headerTitle: {
    color: "#f8fafc",
    fontWeight: 700,
    fontSize: "1rem",
    letterSpacing: "0.3px",
  },

  warningTag: {
    color: "#fbbf24",
    fontSize: "0.7rem",
    padding: "4px 10px",
    border: "1px solid rgba(251,191,36,0.4)",
    borderRadius: "999px",
    background: "rgba(251,191,36,0.08)",
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
    color: "#94a3b8",
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
    boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
  },

  aiBubble: {
    alignSelf: "flex-start",
    background: "rgba(255,255,255,0.08)",
    color: "#e5e7eb",
    padding: "12px 16px",
    borderRadius: "18px 18px 18px 4px",
    maxWidth: "75%",
    fontSize: "0.9rem",
    lineHeight: "1.4",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.08)",
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
    background: "rgba(15,23,42,0.9)",
    color: "#f8fafc",
    border: "1px solid rgba(148,163,184,0.2)",
    outline: "none",
    fontSize: "0.9rem",
  },

  sendButton: {
    padding: "0 22px",
    color: "#fff",
    borderRadius: "14px",
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    boxShadow: "0 6px 18px rgba(34,197,94,0.35)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },
};
