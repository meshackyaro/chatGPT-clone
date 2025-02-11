
function displayMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
    messageDiv.textContent = message;
    mainElement.appendChild(messageDiv);
    mainElement.scrollTop = mainElement.scrollHeight;
}

async function handleSubmit(event) {
    event.preventDefault();
    
    const userMessage = inputElement.value.trim();
    if (!userMessage) return;
    
    // Clear input
    inputElement.value = '';
    
    // Display and save user message
    displayMessage(userMessage, true);
    addToHistory(userMessage, true);
    
    // Disable input while waiting for response
    inputElement.disabled = true;
    submitButton.disabled = true;
    
    try {
        // Get and display AI response
        const response = await getMessage(userMessage);
        displayMessage(response, false);
        addToHistory(response);
    } catch (error) {
        console.error('Error:', error);
        displayMessage('An error occurred. Please try again.', false);
    } finally {
        // Re-enable input
        inputElement.disabled = false;
        submitButton.disabled = false;
        inputElement.focus();
    }
}

// Function to start a new chat
function startNewChat() {
    // Clear the main chat area
    mainElement.innerHTML = '';
    
    // Clear the history sidebar
    historyElement.innerHTML = '';
    
    // Clear the conversation history array
    conversationHistory = [];
    
    // Clear localStorage
    localStorage.removeItem('chatHistory');
    
    // Clear input field
    inputElement.value = '';
    
    // Add initial greeting message
    displayMessage('How can I help you today?', false);
}