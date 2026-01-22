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
        <div className="chatbot-panel">
          <div className="chatbot-header">
            AI Tutor
            <span onClick={() => setOpen(false)}>
              ✕
            </span>
          </div>

          <div className="chatbot-body">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-msg ${m.role}`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot">
                Thinking...
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage()
              }
              placeholder="Ask something..."
            />
            <button onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
