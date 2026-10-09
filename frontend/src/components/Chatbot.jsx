import { useEffect, useState } from "react";
import api from "../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../styles/Chatbot.css";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Thinking...");

  const loadingMessages = [
    "Thinking...",
    "Checking that...",
    "Looking into it...",
    "Almost there...",
    "Preparing your answer...",
  ];

  useEffect(() => {
    if (!loading) {
      setLoadingText("Thinking...");
      return;
    }

    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[currentIndex]);
    }, 1500);

    return () => clearInterval(interval);
  }, [loading]);

  const askQuestion = async () => {
    if (!question.trim() || loading) {
      return;
    }

    const userQuestion = question.trim();
    const conversationHistory = messages.slice(-10);

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        sender: "user",
        text: userQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await api.post("/api/chatbot/ask", {
        question: userQuestion,
        messages: conversationHistory,
      });

      const botAnswer = response.data.answer;

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "bot",
          text: botAnswer,
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      console.error("Server response:", error.response?.data);

      const serverMessage =
        error.response?.data?.details?.error?.message ||
        error.response?.data?.error ||
        "Sorry, something went wrong. Please try again.";

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "bot",
          text: serverMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      askQuestion();
    }
  };

  return (
    <div className="chatbot">
      {isOpen && (
        <aside className="chatbot-sidebar">
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <h2 className="chatbot-title">PrimeMeat Assistant</h2>

              <p className="chatbot-status">Online</p>
            </div>

            <button
              className="chatbot-close-button"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome-message">
                <p>Hello! How can I help you with PrimeMeat?</p>

                <p>
                  Ask me about our products, ordering process, delivery or other
                  PrimeMeat information.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`chatbot-message-row ${
                  message.sender === "user"
                    ? "chatbot-message-row-user"
                    : "chatbot-message-row-bot"
                }`}
              >
                <div
                  className={`chatbot-message ${
                    message.sender === "user"
                      ? "chatbot-message-user"
                      : "chatbot-message-bot"
                  }`}
                >
                  {message.sender === "user" ? (
                    message.text
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-message-row chatbot-message-row-bot">
                <div className="chatbot-message chatbot-message-bot">
                  {loadingText}
                </div>
              </div>
            )}
          </div>

          <div className="chatbot-input-container">
            <input
              className="chatbot-input"
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              disabled={loading}
            />

            <button
              className="chatbot-send-button"
              type="button"
              onClick={askQuestion}
              disabled={loading}
            >
              {loading ? "..." : "Ask"}
            </button>
          </div>
        </aside>
      )}

      <button
        className="chatbot-bubble"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? (
          "×"
        ) : (
          <img src="/images/bubble.png" alt="Open PrimeMeat chatbot" />
        )}
      </button>
    </div>
  );
}

export default Chatbot;
