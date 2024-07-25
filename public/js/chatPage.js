const btn = document.getElementById('sendButton');
const usersList = document.getElementById('usersList');
const groupList = document.getElementById('groupList');
const chatBody = document.getElementById('chatBody');
const messageInput = document.getElementById('messageInput');

let selectedUserId = null;
let selectedGroup = null;
let selectedUserName = null;
let lastDisplayedMessageId = 0;

// Event listener for DOMContentLoaded
window.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed');
    await fetchAndDisplayUsers();
    getAllGroups();
    // Uncomment if needed
    // setInterval(fetchAndDisplayMessages, 1000);
});

// Fetch and display users, excluding the logged-in user
async function fetchAndDisplayUsers() {
    console.log('Fetching users...');
    const token = localStorage.getItem('tokenChatApp');
    if (!token) {
        console.error('No token found');
        return;
    }

    try {
        const response = await axios.get('http://localhost:3000/user/', {
            headers: { "Authorization": `Bearer ${token}` }
        });
        console.log('Users fetched:', response.data);
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

function populateGrouplist(groupsName){
    groupList.innerHTML='';
    groupsName.forEach(group=>{
        const li=document.createElement('li');
        li.className='list-group';
        li.textContent=group;
        li.addEventListener('click',()=>selectGroup(group));
        groupList.appendChild(li);
    })
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

function selectGroup(group){
    selectedGroup=group
    const chatName=document.getElementById('chatName');
    chatName.innerText=group;
    chatBody.innerHTML= '';
     lastDisplayedMessageId = 0;
     console.log(group);
    fetchAndDisplayMessagesforGroup(group);
}

// Add message to group or user
btn.addEventListener('click', async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) {
        return;
    }

    const token = localStorage.getItem('tokenChatApp');
    if (!token) {
        console.error('No token found');
        return;
    }

    try {
        if (selectedGroup) {
            console.log('Sending message to group:', selectedGroup);

            const response = await axios.post(`http://localhost:3000/groups/groupmessages/${selectedGroup}`, 
                { message: message, groupName: selectedGroup }, 
                { headers: { "Authorization": `Bearer ${token}` } }
            );

            messageInput.value = '';
            appendMessage(response.data.message);
        } else if (selectedUserId) {
            console.log('Sending message to user ID:', selectedUserId);

            const response = await axios.post('http://localhost:3000/chats/message', 
                { message: message, receiverId: selectedUserId }, 
                { headers: { "Authorization": `Bearer ${token}` } }
            );

            messageInput.value = '';
            appendMessageOneToOne(response.data.message);
        } else {
            console.error('No user or group selected');
        }
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
        console.log('Fetching messages for user ID:', selectedUserId);

        const response = await axios.get(`http://localhost:3000/chats/messages/${selectedUserId}`, 
            { headers: { "Authorization": `Bearer ${token}` } }
        );
        console.log('Messages fetched:', response.data);
        const messages = response.data.userMessages;
        
        const newMessages = messages.filter(message => message.id > lastDisplayedMessageId);
        newMessages.forEach(message => {
            appendMessageOneToOne(message);
            lastDisplayedMessageId = message.id; // Update the last displayed message ID
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

async function fetchAndDisplayMessagesforGroup(group){
    const token = localStorage.getItem('tokenChatApp');
    if (!token) {
        console.error('No token found');
        return;
    }
    console.log("888888888", group);

    try {
        console.log('Fetching messages for user ID:', selectedUserId);

        const response = await axios.get(`http://localhost:3000/groups/groupmessages/${group}`, 
            { headers: { "Authorization": `Bearer ${token}` } }
        );
        console.log('Messages fetched:', response.data);
        const messages = response.data.data;
      
        
        const newMessages = messages.filter(message => message.id > lastDisplayedMessageId);
        newMessages.forEach(message => {
            appendMessage(message);
            lastDisplayedMessageId = message.id; // Update the last displayed message ID
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

function appendMessageOneToOne(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(message.isSent ? 'sent' : 'received');
    messageDiv.textContent = `${message.userName}: ${message.message}`;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll to the bottom
}

function appendMessage(message) {
   
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(message.isSent ? 'sent' : 'received');
    messageDiv.textContent = `${message.sender.name}: ${message.message}`;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll to the bottom
}

// Create Group Section
const createGroupButton = document.getElementById('createGroupButton');
const createGroupPopup = document.getElementById('createGroupPopup');
const createGroupForm = document.getElementById('createGroupForm');
const groupMembersContainer = document.getElementById('groupMembers');
const cancelCreateGroupButton = document.getElementById('cancelCreateGroupButton');

// Show or hide the create group popup
createGroupButton.addEventListener('click', () => {
    createGroupPopup.classList.toggle('show');
});

// Close the create group popup
cancelCreateGroupButton.addEventListener('click', () => {
    createGroupPopup.classList.remove('show');
});

// Fetch and populate users for group creation
async function populateGroupMembers() {
    console.log('Fetching users for group creation...');
    try {
        const response = await axios.get('http://localhost:3000/user/', {
            headers: { "Authorization": `Bearer ${localStorage.getItem('tokenChatApp')}` }
        });
        const users = response.data;

        // Clear previous checkboxes
        groupMembersContainer.innerHTML = '';

        // Add checkboxes for each user
        users.forEach(user => {
            const div = document.createElement('div');
            div.classList.add('form-check');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('form-check-input');
            checkbox.value = user.id;
            checkbox.id = `user-${user.id}`;

            const label = document.createElement('label');
            label.classList.add('form-check-label');
            label.htmlFor = checkbox.id;
            label.textContent = user.name;

            div.appendChild(checkbox);
            div.appendChild(label);
            groupMembersContainer.appendChild(div);
        });
    } catch (error) {
        console.error('Error fetching users for group:', error);
    }
}

// Handle form submission for group creation
createGroupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const groupName = document.getElementById('groupName').value.trim();
    const selectedMembers = Array.from(document.querySelectorAll('#groupMembers input:checked')).map(checkbox => checkbox.value);

    if (!groupName || selectedMembers.length === 0) {
        console.error('Group name and members must be selected');
        return;
    }

    try {
        const response = await axios.post('http://localhost:3000/groups/groupmessages', {
            name: groupName,
            users: selectedMembers
        }, {
            headers: { "Authorization": `Bearer ${localStorage.getItem('tokenChatApp')}` }
        });


        console.log('Group created successfully:', response.data);
        createGroupPopup.classList.remove('show');
    } catch (err) {
        console.error('Error creating group:', err);
    }
});

  async function getAllGroups(){
    try{
        const token=localStorage.getItem('tokenChatApp')
        if(!token){
            console.log("Login again...")
        }
        console.log("Response from getAllgroup function: ")
        const response = await axios.get('http://localhost:3000/groups/groupmessages',
            {
            headers: { "Authorization": `Bearer ${token}` }
        }
        );
        console.log("Response from getAllgroup function: ",response)
        populateGrouplist(response.data.groupNameArray);
        
    }catch(err){
        console.log(err);
    }
}

// Populate group members on page load
window.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed for group members');
    await populateGroupMembers();
});


function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}