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
  // Dark mode setup
  const button = document.querySelector('.dark-mode-toggle');
  const theme = localStorage.getItem('theme') || 'light';
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  if (button) {
    button.textContent = isDark ? '☀️' : '🌙';
    button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    button.disabled = false;
    button.addEventListener('click', toggleDarkMode);
  }

  // Chat logic setup
  const chatForm = document.getElementById('chat-form');
  const chatWindow = document.getElementById('chat-window');
  const userInput = document.getElementById('user-input');
  const attachBtn = document.querySelector('.attach-btn');

  if (!chatForm || !chatWindow || !userInput || !attachBtn) {
    console.error('Required chat elements not found in DOM.');
    return;
  }

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
      let base64string = e.target.result.split(',')[1];
      attachedFile = {
        mime_type: file.type,
        data: base64string
      };
      attachBtn.innerHTML = '<span>✅</span>';
    };
    reader.readAsDataURL(file);
  });

  const Api_Url = 'https://your-backend.onrender.com/api/chat';

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage('user', message, attachedFile);

    userInput.value = '';
    userInput.disabled = true;

    const loadingDiv = appendMessage('bot', '<img src="/assets/loading.webp" alt="Loading..." width="30">');

    try {
      const response = await fetch(Api_Url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          file: attachedFile
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.generated_text || "Sorry, I didn't understand that.";
      loadingDiv.querySelector('.message-text').innerHTML = formatReply(botReply);
    } catch (error) {
      loadingDiv.querySelector('.message-text').innerHTML = 'There was an error. Please try again.';
      console.error('Fetch error:', error);
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

    if (sender === 'user') {
      html += `<img src="/assets/R.jpg" alt="User avatar" class="avatar" style="width:32px;height:32px;border-radius:50%;margin-right:8px;">`;
      html += `<span class="message-text">${escapeHtml(text)}</span>`;
    } else if (sender === 'bot') {
      html += `<img src="/assets/OIP.jpg" alt="Chatbot avatar" class="avatar" style="width:32px;height:32px;border-radius:50%;margin-right:8px;">`;
      html += `<span class="message-text">${text}</span>`;
    }

    if (fileObj && fileObj.data) {
      html += `<br><img src="data:${fileObj.mime_type};base64,${fileObj.data}" class="chooseimg" style="max-width:120px;max-height:120px;">`;
    }

    html += `</div>`;
    msgDiv.innerHTML = html;
    chatWindow.appendChild(msgDiv);
    msgDiv.scrollIntoView({ behavior: 'smooth' });
    return msgDiv;
  }

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatReply(reply) {
    return reply
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .trim();
  }
});
