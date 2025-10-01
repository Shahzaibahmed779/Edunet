import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./Chat.css";
import iconchat from "./icon-chat2.png";

const Chat = ({ room }) => {
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email || "defaultUser@example.com";

  const socket = io.connect("http://localhost:3001/chat");
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else {
          console.log("Notification permission denied.");
        }
      });
    }
  }, []);

  useEffect(() => {
    socket.emit("joinRoom", room._id);

    socket.on("chatHistory", (chats) => {
      setMessages(
        chats.map((chat) => ({
          id: chat._id,
          text: chat.message,
          sender: chat.email,
        }))
      );
    });

    socket.on("newMessage", (newMessage) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: newMessage._id,
          text: newMessage.message,
          sender: newMessage.email,
        },
      ]);
      if (newMessage.email !== userEmail && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("New Message", {
            body: `${newMessage.email}: ${newMessage.message}`,
            icon: iconchat, // Optional icon
          });
        }
      }
    });

    socket.on("error", (error) => {
      setErrorMessage(error.message || "An error occurred.");
    });

    return () => {
      socket.disconnect();
    };
  }, [room._id]);

  const handleSend = () => {
    setIsSending(true);
    if (!input.trim()) {
      setErrorMessage("Message cannot be empty.");
      return;
    }
    setErrorMessage("");

    socket.emit("sendMessage", {
      email: userEmail,
      privateclassroomid: room._id,
      message: input,
    });
    setInput("");
    setIsSending(false);
  };

  return (
    <div className="chat-room-container-enhanced">
      <div className="chat-content-enhanced">
        {/* Enhanced Messages Area */}
        <div className="chat-messages-enhanced">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message-bubble ${message.sender === userEmail
                  ? "message-sent"
                  : "message-received"
                  }`}
              >
                <div className="message-header">
                  <span className="sender-name">
                    {message.sender === userEmail ? "You" : message.sender.split('@')[0]}
                  </span>
                </div>
                <div className="message-text">
                  {message.text}
                </div>
              </div>
            ))
          ) : (
            <div className="no-messages">
              <p>Start the conversation!</p>
              <small>Be the first to send a message in this room.</small>
            </div>
          )}
        </div>

        {/* Enhanced Input Area */}
        <div className="chat-input-enhanced">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="message-input"
              onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
            />
            <button
              onClick={handleSend}
              className="send-button-enhanced"
              disabled={isSending}
            >
              {isSending ? (
                <div className="send-spinner"></div>
              ) : (
                <>
                  <span>Send</span>
                  <span className="send-icon">➤</span>
                </>
              )}
            </button>
          </div>
          {errorMessage && <p className="error-message-enhanced">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default Chat;