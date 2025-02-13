const submitButton = document.querySelector("#submit");
const inputElement = document.querySelector("input");
const historyElement = document.querySelector(".history");
const mainElement = document.querySelector(".main");
const newChatButton = document.querySelector(".new-chat-button");

let API_KEY = ""; // Default empty, will be set from config.json
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

let conversationHistory = [];

// Load API key from config.json
async function loadConfig() {
  try {
    const response = await fetch("./config.json");
    const config = await response.json();
    API_KEY = config.API_KEY;
    console.log("API Key loaded successfully.");
  } catch (error) {
    console.error("Error loading API key:", error);
  }
}

// Call loadConfig to set API_KEY before making requests
loadConfig();

async function getMessage(userMessage) {
  if (!API_KEY) {
    console.error("API Key is missing or not loaded yet!");
    return "API key is not available. Please try again.";
  }

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userMessage,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    const data = await response.json();
    return (
      data.candidates[0]?.content?.parts[0]?.text || "No response from API."
    );
  } catch (error) {
    console.error("Error:", error);
    return "An error occurred while fetching the response.";
  }
}

function addToHistory(message, isUser = false) {
  const timestamp = new Date().toLocaleTimeString();
  const historyItem = document.createElement("p");
  historyItem.textContent = `${
    isUser ? "You" : "AI"
  } (${timestamp}): ${message}`;
  historyElement.appendChild(historyItem);

  conversationHistory.push({
    role: isUser ? "user" : "assistant",
    message: message,
    timestamp: timestamp,
  });

  localStorage.setItem("chatHistory", JSON.stringify(conversationHistory));
}

// Add styles for messages
const style = document.createElement("style");
style.textContent = `
    .message {
        padding: 15px;
        margin: 10px;
        border-radius: 5px;
        max-width: 80%;
        word-wrap: break-word;
    }

    .user-message {
        background-color: #2b2c2f;
        align-self: flex-end;
        margin-left: auto;
    }

    .ai-message {
        background-color: #444654;
        align-self: flex-start;
        margin-right: auto;
    }

    .main {
        padding: 20px;
        overflow-y: auto;
    }

    .new-chat-button {
        width: calc(100% - 20px);
        margin: 10px;
        padding: 10px;
        background-color: transparent;
        border: 1px solid rgba(255, 255, 255, 0.5);
        color: white;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .new-chat-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
`;
document.head.appendChild(style);
