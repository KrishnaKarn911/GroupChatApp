const btn=document.getElementById('sendButton');
const LOCAL_STORAGE_KEY = 'chatMessages';
const MAX_LOCAL_MESSAGES = 10;


window.addEventListener('DOMContentLoaded',async()=>{
    loadMessagesFromLocalStorage();
    await fetchAndDisplayMessages();
    setInterval(fetchAndDisplayMessages, 1000);
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
        appendMessage(response.data.message);
        saveMessageToLocalStorage(response.data.message);
    }  
    catch (err) {
            console.error('Error sending message:', err);
        }
    });


    function loadMessagesFromLocalStorage() {
        const storedMessages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        storedMessages.forEach(message => appendMessage(message));
    }

    async function fetchAndDisplayMessages() {
        const token = localStorage.getItem('tokenChatApp');
        if (!token) {
            console.error('No token found');
            return;
        }

        try {
            const lastMessageTime = getLastMessageTime();
            const response = await axios.get(`http://localhost:3000/chats/message?since=${lastMessageTime}`, 
                { headers: { "Authorization": token } }
            );
            console.log(response.data.messages);
            

            
            const newMessages = response.data.messages;
            newMessages.forEach(message => {
            appendMessage(message);
            saveMessageToLocalStorage(message);
            });
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


    function saveMessageToLocalStorage(message) {
        let storedMessages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    
        // Add the new message and remove old messages if exceeding the limit
        storedMessages.push(message);
        if (storedMessages.length > MAX_LOCAL_MESSAGES) {
            storedMessages.shift();
        }
    
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedMessages));
    }
    
    // Get the timestamp of the last message
    function getLastMessageTime() {
        const storedMessages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        return storedMessages.length > 0 ? storedMessages[storedMessages.length - 1].createdAt : 0;
    }
