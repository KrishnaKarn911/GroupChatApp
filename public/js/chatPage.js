document.getElementById('sendButton').addEventListener('click', function() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    if (messageText) {
      const chatBody = document.getElementById('chatBody');
      const newMessage = document.createElement('div');
      newMessage.classList.add('message', 'sent');
      newMessage.textContent = messageText;
      chatBody.appendChild(newMessage);
      messageInput.value = '';
      chatBody.scrollTop = chatBody.scrollHeight; // Scroll to bottom
    }
  });