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


import { useState } from "react";
import "../dashboard.css";
import { refreshAccessToken } from "../api";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi 👋 I’m your AI Tutor!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);

    const request = async (token) =>
      fetch("http://127.0.0.1:8000/api/ai/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

    try {
      let token = localStorage.getItem("access");
      let res = await request(token);

      // 🔁 Auto-refresh on expiry
      if (res.status === 401) {
        token = await refreshAccessToken();
        if (!token) throw new Error("Session expired");
        res = await request(token);
      }

      const data = await res.json();

      setMessages((m) => [
        ...m,
        { role: "bot", text: data.reply },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text:
            "Your session expired. Please login again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="chatbot-circle"
        onClick={() => setOpen(!open)}
      >
        🤖
      </div>

      {open && (
        <div className="chatbot-panel" style={{ border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
          <div className="chatbot-header" style={{ padding: '16px 20px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🤖</span>
              <span style={{ fontWeight: '600', letterSpacing: '0.02em' }}>AI Tutor</span>
            </div>
            <span
              style={{ cursor: "pointer", opacity: 0.8, fontSize: '1.2rem' }}
              onClick={() => setOpen(false)}
            >
              ✕
            </span>
          </div>

          <div className="chatbot-body" style={{ background: '#f8fafc', padding: '20px' }}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-msg ${m.role}`}
                style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  boxShadow: m.role === 'bot' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  background: m.role === 'bot' ? 'white' : 'var(--primary)',
                  color: m.role === 'bot' ? 'var(--text-main)' : 'white',
                  alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end',
                  borderBottomLeftRadius: m.role === 'bot' ? '2px' : '12px',
                  borderBottomRightRadius: m.role === 'user' ? '2px' : '12px',
                  marginLeft: m.role === 'user' ? 'auto' : '0',
                  marginRight: m.role === 'bot' ? 'auto' : '0'
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot" style={{ background: 'white', color: '#64748b', fontStyle: 'italic' }}>
                Thinking...
              </div>
            )}
          </div>

          <div className="chat-input" style={{ padding: '16px', background: 'white', borderTop: '1px solid #e2e8f0' }}>
            <input
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage()
              }
              placeholder="Ask a question..."
              style={{ background: '#f1f5f9', border: 'none', padding: '12px 16px', borderRadius: '12px' }}
            />
            <button className="btn btn-primary" onClick={sendMessage} style={{ borderRadius: '12px', padding: '12px 16px' }}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
