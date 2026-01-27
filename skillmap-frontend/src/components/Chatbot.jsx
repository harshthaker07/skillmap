// import { useState } from "react";
// import "../dashboard.css";

// function Chatbot() {
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     { role: "bot", text: "Hi 👋 I’m your AI Tutor!" },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const text = input;
//     setInput("");

//     setMessages((prev) => [
//       ...prev,
//       { role: "user", text },
//     ]);

//     setLoading(true);

//     try {
//       const res = await fetch(
//         "http://127.0.0.1:8000/api/ai/chat/",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("access")}`,
//           },
//           body: JSON.stringify({ message: text }),
//         }
//       );

//       const data = await res.json();

//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "bot",
//           text:
//             data.reply ||
//             "I couldn’t generate an answer.",
//         },
//       ]);
//     } catch (err) {
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "bot",
//           text: "AI service error ❌",
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       {/* CHAT ICON */}
//       <div
//         className="chatbot-circle"
//         onClick={() => setOpen(!open)}
//       >
//         🤖
//       </div>

//       {/* CHAT PANEL */}
//       {open && (
//         <div className="chatbot-panel">
//           <div className="chatbot-header">
//             <span>AI Tutor</span>
//             <span
//               style={{ cursor: "pointer" }}
//               onClick={() => setOpen(false)}
//             >
//               ✕
//             </span>
//           </div>

//           <div className="chatbot-body">
//             {messages.map((m, i) => (
//               <div
//                 key={i}
//                 className={`chat-msg ${m.role}`}
//               >
//                 {m.text}
//               </div>
//             ))}

//             {loading && (
//               <div className="chat-msg bot">
//                 Thinking...
//               </div>
//             )}
//           </div>

//           <div className="chat-input">
//             <input
//               value={input}
//               onChange={(e) =>
//                 setInput(e.target.value)
//               }
//               onKeyDown={(e) =>
//                 e.key === "Enter" && sendMessage()
//               }
//               placeholder="Ask something..."
//             />
//             <button onClick={sendMessage}>
//               Send
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default Chatbot;



import { useState, useRef, useEffect } from "react";
import "../dashboard.css";
import { refreshAccessToken } from "../api";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: "bot", text: "Hi 👋 I’m your AI Tutor!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const msgId = useRef(2);

  /* =========================
     AUTO SCROLL
  ========================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* =========================
     SEND MESSAGE
  ========================= */
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");

    // 1️⃣ Add user message
    setMessages((prev) => [
      ...prev,
      { id: msgId.current++, role: "user", text: userText },
    ]);

    setLoading(true);

    try {
      const makeRequest = async (token) =>
        fetch("http://127.0.0.1:8000/api/ai/chat/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: userText }),
        });

      let token = sessionStorage.getItem("access");
      let res = await makeRequest(token);

      if (res.status === 401) {
        token = await refreshAccessToken();
        if (!token) throw new Error("Session expired");
        res = await makeRequest(token);
      }

      const data = await res.json();

      if (data?.reply?.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            id: msgId.current++,
            role: "bot",
            text: data.reply.trim(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.text?.includes("session expired")) return prev;

        return [
          ...prev,
          {
            id: msgId.current++,
            role: "bot",
            text: "Your session expired. Please login again.",
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <>
      {/* CHAT BUTTON */}
      <div
        className="chatbot-circle"
        onClick={() => setOpen((o) => !o)}
        title="AI Tutor"
      >
        🤖
      </div>

      {open && (
        <div className="chatbot-wrapper">
          <div className="chatbot-panel">
            {/* HEADER */}
            <div className="chatbot-header">
              <div style={{ display: "flex", gap: 8 }}>
                <span>🤖</span>
                <strong>AI Tutor</strong>
              </div>
              <span
                style={{ cursor: "pointer", fontSize: "1.2rem" }}
                onClick={() => setOpen(false)}
              >
                ✕
              </span>
            </div>

            {/* BODY */}
            <div className="chatbot-body">
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    marginBottom: 12,
                    background:
                      m.role === "bot" ? "#ffffff" : "var(--primary)",
                    color:
                      m.role === "bot"
                        ? "var(--text-main)"
                        : "#ffffff",
                    alignSelf:
                      m.role === "bot"
                        ? "flex-start"
                        : "flex-end",
                    marginLeft: m.role === "user" ? "auto" : 0,
                  }}
                >
                  {m.text}
                </div>
              ))}

              {loading && (
                <div
                  style={{
                    fontStyle: "italic",
                    color: "#64748b",
                    marginBottom: 12,
                  }}
                >
                  Thinking…
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="chat-input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && sendMessage()
                }
                placeholder="Ask a question..."
              />
              <button
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={loading}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
