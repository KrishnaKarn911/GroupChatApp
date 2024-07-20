const btn=document.getElementById('sendButton');


window.addEventListener('DOMContentLoaded',async()=>{
    await fetchAndDisplayMessages();
})


btn.addEventListener('click', async(e) => {
    e.preventDefault();
    const chatBody = document.getElementById('chatBody');
    const messageInput = document.getElementById('messageInput');

    try{
        const message = messageInput.value.trim();
        if (!message) {
            return; // Do nothing if message is empty
        }

        const token = localStorage.getItem('tokenChatApp');
        if (!token) {
            console.error('No token found');
            return;
        }

        const response = await axios.post('http://localhost:3000/chats/message', 
            { message: message }, 
            { headers: { "Authorization": token } }
        );

        document.getElementById('messageInput').value='';
        fetchAndDisplayMessages();
    }  
    catch (err) {
            console.error('Error sending message:', err);
        }
    });

    async function fetchAndDisplayMessages() {
        const token = localStorage.getItem('tokenChatApp');
        if (!token) {
            console.error('No token found');
            return;
        }

        try {
            const response = await axios.get('http://localhost:3000/chats/message', 
                { headers: { "Authorization": token } }
            );
            console.log(response.data.messages);
            const messages = response.data.messages;

            // Clear existing messages
            chatBody.innerHTML = '';

            // Append all messages
            messages.forEach(message => appendMessage(message));
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    function appendMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(message.isSent ? 'sent' : 'received');
        messageDiv.textContent = `${message.userName}: ${message.message}`;
        chatBody.appendChild(messageDiv);
    }
