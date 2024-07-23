const btn = document.getElementById('sendButton');
const usersList = document.getElementById('usersList');
const chatBody = document.getElementById('chatBody');
const messageInput = document.getElementById('messageInput');

let selectedUserId = null;
let selectedUserName = null;
let lastDisplayedMessageId = 0;

window.addEventListener('DOMContentLoaded', async () => {
    await fetchAndDisplayUsers();
   await fetchAndDisplayMessages();
    setInterval(fetchAndDisplayMessages, 1000);
});

// Fetch and display users, excluding the logged-in user
async function fetchAndDisplayUsers() {
    const token = localStorage.getItem('tokenChatApp');
    if (!token) {
        console.error('No token found');
        return;
    }

    try {
        const response = await axios.get('http://localhost:3000/user/', {
            headers: { "Authorization": `Bearer ${token}` }
        });
        console.log(response);
        const users = response.data;
        populateUsersList(users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Populate the users list
function populateUsersList(users) {
    usersList.innerHTML = ''; 
    users.forEach(user => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = user.name;
        li.dataset.userId = user.id;
        li.addEventListener('click', () => selectUser(user.id, user.name));
        usersList.appendChild(li);
    });
}

function selectUser(userId, userName) {
    selectedUserId = userId;
    const chatName = document.getElementById('chatName');
    chatName.innerText = userName;
    selectedUserName = userName;

    chatBody.innerHTML = ''; // Clear chat body
    lastDisplayedMessageId = 0; // Reset the last displayed message ID
    fetchAndDisplayMessages(); // Fetch messages for the selected user
}

// Add message
btn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (selectedUserId === null) {
        console.error('No user selected');
        return;
    }

    try {
        const message = messageInput.value.trim();
        if (!message) {
            return;
        }

        const token = localStorage.getItem('tokenChatApp');
        if (!token) {
            console.error('No token found');
            return;
        }

        console.log(selectedUserId);

        const response = await axios.post('http://localhost:3000/chats/message', 
            { message: message, receiverId: selectedUserId }, 
            { headers: { "Authorization": `Bearer ${token}` } }
        );

        messageInput.value = '';
        appendMessage(response.data.message);
    } catch (err) {
        console.error('Error sending message:', err);
    }
});

// Display messages
async function fetchAndDisplayMessages() {
    if (selectedUserId === null) {
        console.error('No user selected');
        return;
    }

    const token = localStorage.getItem('tokenChatApp');
    if (!token) {
        console.error('No token found');
        return;
    }

    try {
        const response = await axios.get(`http://localhost:3000/chats/messages/${selectedUserId}`, 
            { headers: { "Authorization": `Bearer ${token}` } }
        );
        console.log(response);
        const messages = response.data.userMessages;
        

            const newMessages = messages.filter(message => message.id > lastDisplayedMessageId);
             newMessages.forEach(message => {
            appendMessage(message);
            lastDisplayedMessageId = message.id; // Update the last displayed message ID
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
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll to the bottom
}



