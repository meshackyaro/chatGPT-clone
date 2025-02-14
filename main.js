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

// Ensure API key is loaded before making requests
document.addEventListener("DOMContentLoaded", async () => {
  await loadConfig();
  loadChatHistory();
});

async function getMessage(userMessage) {
  if (!API_KEY) {
    console.error("API Key is missing!");
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
            parts: [{ text: userMessage }],
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
    message,
    timestamp,
  });
  localStorage.setItem("chatHistory", JSON.stringify(conversationHistory));
}

function displayMessage(message, isUser = false) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", isUser ? "user-message" : "ai-message");
  messageDiv.textContent = message;
  mainElement.appendChild(messageDiv);
  mainElement.scrollTop = mainElement.scrollHeight;
}

async function handleSubmit(event) {
  event.preventDefault();

  const userMessage = inputElement.value.trim();
  if (!userMessage) return;

  inputElement.value = "";
  displayMessage(userMessage, true);
  addToHistory(userMessage, true);

  inputElement.disabled = true;
  submitButton.disabled = true;

  try {
    const response = await getMessage(userMessage);
    displayMessage(response, false);
    addToHistory(response);
  } catch (error) {
    console.error("Error:", error);
    displayMessage("An error occurred. Please try again.", false);
  } finally {
    inputElement.disabled = false;
    submitButton.disabled = false;
    inputElement.focus();
  }
}

function startNewChat() {
  mainElement.innerHTML = "";
  historyElement.innerHTML = "";
  conversationHistory = [];
  localStorage.removeItem("chatHistory");
  inputElement.value = "";
  displayMessage("How can I help you today?", false);
}

function loadChatHistory() {
  const savedHistory = localStorage.getItem("chatHistory");
  if (savedHistory) {
    conversationHistory = JSON.parse(savedHistory);
    conversationHistory.forEach((item) => {
      displayMessage(item.message, item.role === "user");
      const historyItem = document.createElement("p");
      historyItem.textContent = `${item.role === "user" ? "You" : "AI"} (${
        item.timestamp
      }): ${item.message}`;
      historyElement.appendChild(historyItem);
    });
  } else {
    displayMessage("How can I help you today?", false);
  }
}

submitButton.addEventListener("click", handleSubmit);
inputElement.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSubmit(e);
});
newChatButton.addEventListener("click", startNewChat);
