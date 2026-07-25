import { useState } from "react";

const API = "https://health-digitwin-1.onrender.com";

export default function AIDoctor({ token }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I'm your AI Health Assistant. Ask me anything about your health!" }
  ]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    const userMessage = question;
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setQuestion("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/ask-doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: userMessage, history: messages.slice(-6) })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: "assistant", text: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", text: "Sorry, I could not process that." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: "Could not connect to backend." }]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); }
  };

  return (
    <div>
      <div className="page-title">AI Doctor</div>
      <div className="page-subtitle">Your personal AI health assistant</div>
      <div style={{ background: "#1e2235", border: "1px solid #f87171", borderRadius: "8px", padding: "0.8rem 1rem", marginBottom: "1rem", color: "#fca5a5", fontSize: "0.85rem" }}>
        This AI provides general health information only. Always consult a real doctor for medical decisions.
      </div>
      <div style={{ background: "#1e2235", borderRadius: "12px", padding: "1rem", minHeight: "400px", maxHeight: "500px", overflowY: "auto", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "80%", padding: "0.8rem 1rem", borderRadius: msg.role === "user" ? "12px 12px 0 12px" : "12px 12px 12px 0", background: msg.role === "user" ? "#7c3aed" : "#0f172a", color: "white", lineHeight: "1.6", whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
              {msg.role === "assistant" && <span style={{ color: "#a78bfa", fontWeight: "bold", display: "block", marginBottom: "0.3rem" }}>AI Doctor</span>}
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: "#0f172a", padding: "0.8rem 1rem", borderRadius: "12px 12px 12px 0", color: "#64748b" }}>Thinking...</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask me anything about your health..."
          style={{ flex: 1, padding: "0.8rem", borderRadius: "8px", border: "1px solid #374151", background: "#111827", color: "white", fontSize: "0.95rem", resize: "none", height: "50px" }}
        />
        <button onClick={handleAsk} disabled={loading || !question.trim()} style={{ background: "#7c3aed", color: "white", border: "none", borderRadius: "8px", padding: "0 1.5rem", cursor: "pointer", fontSize: "1.2rem" }}>
          Send
        </button>
      </div>
    </div>
  );
}