const toggleDarkMode = () => {
  const body = document.body;
  const button = document.querySelector('.dark-mode-toggle');
  if (!button) return;

  body.classList.toggle('dark-mode');
  const isDark = body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  button.textContent = isDark ? '☀️' : '🌙';
  button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
};

window.addEventListener('DOMContentLoaded', () => {
  // --- Dark mode setup ---
  const button = document.querySelector('.dark-mode-toggle');
  const theme = localStorage.getItem('theme');
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  if (button) {
    button.textContent = isDark ? '☀️' : '🌙';
    button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    button.disabled = false;
    button.addEventListener('click', toggleDarkMode);
  }

  // --- Chat logic for Gemini API ---
  const chatForm = document.getElementById('chat-form');
  const chatWindow = document.getElementById('chat-window');
  const userInput = document.getElementById('user-input');
  const attachBtn = document.querySelector('.attach-btn');

  if (!chatForm || !chatWindow || !userInput || !attachBtn) {
    console.error("Required chat elements not found in DOM.");
    return;
  }

  // Add a hidden file input for attachments
  let fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.style.display = 'none';
  attachBtn.parentNode.insertBefore(fileInput, attachBtn.nextSibling);

  let attachedFile = null;

  attachBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) {
      attachBtn.innerHTML = '<span>📎</span>';
      attachedFile = null;
      return;
    }
    let reader = new FileReader();
    reader.onload = (e) => {
      let base64string = e.target.result.split(",")[1];
      attachedFile = {
        mime_type: file.type,
        data: base64string
      };
      attachBtn.innerHTML = '<span>✅</span>'; // Show attached
    };
    reader.readAsDataURL(file);
  });

  // Use your backend endpoint (change for deployment)
  const Api_Url = "https://your-backend.onrender.com/api/chat";

  chatForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    // Display user message
    appendMessage('user', message, attachedFile);

    userInput.value = '';
    userInput.disabled = true;

    let RequestOption = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        file: attachedFile
      })
    };

    // Show loading message
    const loadingDiv = appendMessage('bot', '<span class="message-text"><img src="/assest/loading.webp" alt="Loading..." width="30"></span>');

    try {
      let response = await fetch(Api_Url, RequestOption);
      let data = await response.json();

      if (data.error) {
        loadingDiv.querySelector('.message-text').innerHTML = "API Error: " + data.error;
        return;
      }

      let botReply = data.generated_text || "Sorry, I didn't understand that.";
      // Format: convert double line breaks to <p>, single to <br>
      botReply = botReply
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br>")
        .trim();
      botReply = `<p>${botReply}</p>`;

      loadingDiv.querySelector('.message-text').innerHTML = botReply;
      loadingDiv.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      loadingDiv.querySelector('.message-text').innerHTML = "There was an error. Please try again.";
      console.error("Fetch error:", error);
    } finally {
      userInput.disabled = false;
      userInput.focus();
      attachedFile = null;
      attachBtn.innerHTML = '<span>📎</span>';
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  });

  function appendMessage(sender, text, fileObj = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    let html = `<div class="message-bubble ${sender}">`;

    // Add avatar image based on sender
    if (sender === 'user') {
      html += `<img src="/assest/R.jpg" alt="User" class="avatar" style="width:32px;height:32px;border-radius:50%;margin-right:8px;">`;
      html += `<span class="message-text">${escapeHtml(text)}</span>`;
    } else if (sender === 'bot') {
      html += `<img src="/assest/OIP.jpg" alt="Bot" class="avatar" style="width:32px;height:32px;border-radius:50%;margin-right:8px;">`;
      html += `<span class="message-text"></span>`;
    }

    if (fileObj && fileObj.data) {
      html += `<br><img src="data:${fileObj.mime_type};base64,${fileObj.data}" class="chooseimg" style="max-width:120px;max-height:120px;">`;
    }
    html += `</div>`;
    msgDiv.innerHTML = html;
    chatWindow.appendChild(msgDiv);

    // If bot, insert HTML after creation (for formatted replies)
    if (sender === 'bot') {
      msgDiv.querySelector('.message-text').innerHTML = text;
    }

    msgDiv.scrollIntoView({ behavior: "smooth" });
    return msgDiv;
  }

  // Helper to escape HTML for user messages
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});