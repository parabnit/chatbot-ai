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
          accumulated += decoder.decode(value, { stream: true });

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
              style={
                msg.role === "user" ? styles.userBubble : styles.aiBubble
              }
            >
              {msg.role === "assistant" ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlightText(msg.text) +
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
          }}
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>

      {/* Cursor animation */}
      <style>
        {`
        .cursor {
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%,50% { opacity:1 }
          51%,100% { opacity:0 }
        }
      `}
      </style>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", height: "100%" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
  },
  headerTitle: { color: "#fff", fontWeight: 600 },
  warningTag: {
    color: "#f59e0b",
    fontSize: "0.75rem",
    padding: "4px 8px",
    border: "1px solid rgba(245,158,11,0.3)",
    borderRadius: "6px",
  },
  chatWindow: { flex: 1, overflowY: "auto" },
  emptyState: {
    color: "#64748b",
    textAlign: "center",
    marginTop: "40%",
    fontStyle: "italic",
  },
  userBubble: {
    background: "linear-gradient(135deg,#2563eb,#3b82f6)",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "20px 20px 4px 20px",
    maxWidth: "80%",
  },
  aiBubble: {
    background: "rgba(255,255,255,0.08)",
    color: "#e5e7eb",
    padding: "12px 18px",
    borderRadius: "20px 20px 20px 4px",
    maxWidth: "80%",
    backdropFilter: "blur(6px)",
  },
  inputContainer: { display: "flex", gap: "10px", marginTop: "10px" },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "14px",
    background: "rgba(0,0,0,0.3)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  sendButton: {
    padding: "0 24px",
    color: "#fff",
    borderRadius: "14px",
    border: "none",
    fontWeight: "700",
  },
};
