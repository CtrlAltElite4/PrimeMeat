import React from "react";

const ChatbotBubble = ({ onClick }) => {
  return (
    <button
      className="chatbot-bubble"
      onClick={onClick}
      aria-label="Open PrimeMeat chatbot"
    >
      <img src="/images/bubble.png" alt="PrimeMeat chatbot" />
    </button>
  );
};

export default ChatbotBubble;
