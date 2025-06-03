import React, { useState, useEffect, useRef } from 'react';

const ChatBot = ({ isDarkTheme }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const greetingMessage = { 
      text: "Hello! I am your Lung Disease Detection Assistant. How can I help you today?", 
      sender: "bot" 
    };
    setMessages([greetingMessage]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "LungDiseaseChatBot",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct:free",
          messages: [
            { role: "system", content: "You are a helpful medical assistant specialized in lung disease detection." },
            ...newMessages.map(msg => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text
            }))
          ]
        })
      });

      if (!response.ok) throw new Error("Failed to fetch from OpenRouter");

      const data = await response.json();
      const botReply = data.choices[0].message.content;

      setMessages([...newMessages, { text: botReply, sender: "bot" }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([...newMessages, {
        text: "Sorry, I couldn't connect to the AI model. Please try again later.",
        sender: "bot"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        text: "Hello! I am your Lung Disease Detection Assistant. How can I help you today?",
        sender: "bot"
      }
    ]);
    setInput("");
  };

  return (
    <div className="content-area chatbot-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 className="content-title" style={{ color: isDarkTheme ? 'Black' : '#1a202c' }}>ChatBot</h1>

      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 10px" }}>
        <button onClick={handleClearChat} style={{ marginBottom: "10px" }}>Clear Chat</button>
      </div>

      <div className="chatbot-wrapper chatbot-messages" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              background: msg.sender === "user" ? "#007bff" : "#e4e6eb",
              color: msg.sender === "user" ? "white" : "black",
              padding: "8px 12px",
              borderRadius: "15px",
              margin: "5px 0",
              maxWidth: "60%"
            }}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div style={{ alignSelf: "flex-start", color: "gray", fontStyle: "italic", margin: "5px 0" }}>
            Bot is typing<span className="dots">...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input" style={{ display: 'flex', padding: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about lung disease detection..."
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
          disabled={loading}
          style={{ flex: 1, marginRight: '10px', padding: '10px' }}
        />
        <button onClick={handleSendMessage} disabled={loading}>Send</button>
      </div>

      {/* Typing dots animation */}
      <style>
        {`
          .dots::after {
            content: '';
            display: inline-block;
            width: 1em;
            animation: dots 1.5s steps(3, end) infinite;
          }

          @keyframes dots {
            0%   { content: ''; }
            33%  { content: '.'; }
            66%  { content: '..'; }
            100% { content: '...'; }
          }
        `}
      </style>
    </div>
  );
};

export default ChatBot;