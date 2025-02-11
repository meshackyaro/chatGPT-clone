// Get DOM elements
const submitButton = document.querySelector("#submit");
const inputElement = document.querySelector("input");
const historyElement = document.querySelector(".history");
const mainElement = document.querySelector(".main");
const newChatButton = document.querySelector(".new-chat-button"); // Add this line

// Replace with your actual API key from Google AI Studio
const API_KEY = "AIzaSyD9gaGj-SplGCHJDPTOEboI1RmuiNEBS4c";
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

let conversationHistory = [];

async function getMessage(userMessage) {
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
    return data.candidates[0].content.parts[0].text;
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

  // Save to conversation history
  conversationHistory.push({
    role: isUser ? "user" : "assistant",
    message: message,
    timestamp: timestamp,
  });

  // Save to localStorage
  localStorage.setItem("chatHistory", JSON.stringify(conversationHistory));
}
