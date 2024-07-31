const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput')

const btn = document.getElementById('sendButton');
const usersList = document.getElementById('usersList');
const groupList = document.getElementById('groupList');
const chatBody = document.getElementById('chatBody');
const messageInput = document.getElementById('messageInput');
const chatHeader = document.querySelector('.chat-header');

const userSearchButton = document.getElementById('userSearchButton');
const groupSearchButton = document.getElementById('groupSearchButton');
const userSearchInput = document.getElementById('userSearchInput');
const groupSearchInput = document.getElementById('groupSearchInput');

let selectedUserId = null;
let selectedGroup = null;
let selectedUserName = null;
let lastDisplayedMessageId = 0;

const token=localStorage.getItem('tokenChatApp');
var userName = parseJwt(token).name;

let socket;

// Function to initialize the socket connection
function initializeSocket() {
    if (!socket) {
        console.log('Initializing socket');
        socket = io();

        socket.on('connect', () => {
            console.log("User connected with id: ", socket.id);
            if (selectedUserId) {
                socket.emit('join-room', { userId: selectedUserId });
            }
            if (selectedGroup) {
                socket.emit('join-room', { group: selectedGroup });
            }
        });

        socket.on('receive-message', ({ message, from }) => {

            console.log("In receive message socket: " ,message, from);
            if (selectedUserId || selectedGroup) {
                appendMessage({ message, sender: { id: from, name: from } });
            }
        });
    } else {
        console.log('Socket already initialized');
    }
}

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
        const response = await axios.get('http://13.201.75.236:3000/user/', {
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

function populateGrouplist(groupsName) {
    const groupList = document.getElementById('groupList');
    groupList.innerHTML = '';

    groupsName.forEach(group => {
        const li = document.createElement('li');
        li.className = 'list-group-item';

        const groupText = document.createElement('span');
        groupText.innerText = group;
        groupText.addEventListener('click', () => selectGroup(group));

        const editGroupBtn = document.createElement('button');
        editGroupBtn.innerText = 'Edit';
        editGroupBtn.className = 'btn btn-secondary btn-sm ml-2';
        editGroupBtn.setAttribute('id', 'editGroupBtn');

        editGroupBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents the click event from propagating to the list item
            console.log("Edit button clicked");
            console.log(e.target);
            openEditGroupPopup(group);
        });

        li.appendChild(groupText);
        li.appendChild(editGroupBtn);
        groupList.appendChild(li);
    });
}

function openEditGroupPopup(groupName) {
    const editGroupPopup = document.getElementById('editGroupPopup');
    const editGroupActions = document.getElementById('editGroupActions');
    const editGroupMembers = document.getElementById('editGroupMembers');

    editGroupPopup.style.display = 'block';

    document.getElementById('addUserButton').addEventListener('click', () => {
        showUsersNotInGroup(groupName);
    });

    document.getElementById('removeUserButton').addEventListener('click', () => {
        showGroupMembersForRemoval(groupName);
    });

    document.getElementById('addAdminButton').addEventListener('click', () => {
        showGroupMembersForAdmin(groupName);
    });

    document.getElementById('cancelEditGroupButton').addEventListener('click', () => {
        editGroupPopup.style.display = 'none';
        editGroupActions.style.display = 'block';
        editGroupMembers.style.display = 'none';
    });
}


function showUsersNotInGroup(groupName) {

    let token=localStorage.getItem('tokenChatApp');
    const editGroupActions = document.getElementById('editGroupActions');
    const editGroupMembers = document.getElementById('editGroupMembers');

    editGroupActions.style.display = 'none';
    editGroupMembers.style.display = 'block';

    // Fetch users not in the group
    axios.get(`/user/NotPartOfgroups/${groupName}`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => {
            const users = response.data;
       
            populateCheckboxGroup(users, 'addUser', groupName);
        })
        .catch(error => {
            console.error(error);
        });
}


function showGroupMembersForRemoval(groupName) {
    let token=localStorage.getItem('tokenChatApp');
    const editGroupActions = document.getElementById('editGroupActions');
    const editGroupMembers = document.getElementById('editGroupMembers');

    editGroupActions.style.display = 'none';
    editGroupMembers.style.display = 'block';

    // Fetch group members
    axios.get(`/user/groupsUser/${groupName}`,{
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => {
            
            const users = response.data;
            populateCheckboxGroup(users, 'removeUser',groupName);
        })
        .catch(error => {
            console.error(error);
        });
}


function showGroupMembersForAdmin(groupName) {
    const token=localStorage.getItem('tokenChatApp');
    const editGroupActions = document.getElementById('editGroupActions');
    const editGroupMembers = document.getElementById('editGroupMembers');

    editGroupActions.style.display = 'none';
    editGroupMembers.style.display = 'block';

    // Fetch group members
    axios.get(`/user/groupsUser/${groupName}`,{
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => {
            
            const users = response.data;
            populateCheckboxGroup(users, 'addAdmin',groupName);
        })
        .catch(error => {
            console.error(error);
        });
}


function populateCheckboxGroup(users, action, groupName) {
    const editGroupMembers = document.getElementById('editGroupMembers');
    editGroupMembers.innerHTML = '';

    usersData = users.data;
    console.log(usersData);

    usersData.forEach(user => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = user.id;
        checkbox.id = `user-${user.id}`;

        const label = document.createElement('label');
        label.htmlFor = `user-${user.id}`;
        label.innerText = user.name;

        const div = document.createElement('div');
        div.appendChild(checkbox);
        div.appendChild(label);

        editGroupMembers.appendChild(div);
    });

    const submitButton = document.createElement('button');
    submitButton.innerText = 'Submit';
    submitButton.className = 'btn btn-primary mt-2';
    submitButton.addEventListener('click', () => handleGroupAction(users, action, groupName));

    editGroupMembers.appendChild(submitButton);
}


function handleGroupAction(users, action, groupName) {
    const token=localStorage.getItem('tokenChatApp');
    const selectedUserIds = Array.from(document.querySelectorAll('#editGroupMembers input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

    if (action === 'addUser') {
        // Handle adding users to the group
        axios.post(`/groups/add-users/${groupName}`, { userIds: selectedUserIds }, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(response => {
                alert('Users added successfully');
                document.getElementById('editGroupPopup').style.display = 'none';
            })
            .catch(error => {
                console.error(error);
            });
    } else if (action === 'removeUser') {
        console.log("In remove", groupName);
        // Handle removing users from the group
        axios.post(`/groups/remove-users/${groupName}`, { userIds: selectedUserIds },{
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(response => {
                alert('Users removed successfully');
                document.getElementById('editGroupPopup').style.display = 'none';
            })
            .catch(error => {
                console.error(error);
            });
    } else if (action === 'addAdmin') {
        // Handle adding admin roles to users in the group
        axios.post(`/groups/add-admin/${groupName}`, { userIds: selectedUserIds },{
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(response => {
                alert('Users promoted to admin successfully');
                document.getElementById('editGroupPopup').style.display = 'none';
            })
            .catch(error => {
                console.error(error);
            });
    }
}



function selectUser(userId, userName) {
     
    selectedUserId = userId;
    initializeSocket();
    const chatName = document.getElementById('chatName');
    chatName.innerText = userName;
    selectedUserName = userName;

    chatBody.innerHTML = ''; // Clear chat body
    lastDisplayedMessageId = 0; // Reset the last displayed message ID
    fetchAndDisplayMessages(); // Fetch messages for the selected user
    socket.emit('join-room', { userId: userId });
}

function selectGroup(group){
     
    selectedGroup=group
    initializeSocket();
    const chatName=document.getElementById('chatName');
    
    chatName.innerText=group;
    chatBody.innerHTML= '';
     lastDisplayedMessageId = 0;
     console.log(group);
    fetchAndDisplayMessagesforGroup(group);
    socket.emit('join-room', { group: group });
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

    if (!socket) {
        console.error('Socket not initialized');
        return;
    }
    
    try {
        var userName = parseJwt(token).name; // Extract username from token

        if (selectedGroup) {
            console.log('Sending message to group:', selectedGroup);

            // Send message to server
            socket.emit('send-message', { message: message, group: selectedGroup, username: userName });;

            // Post the message to the server (for persistence)
            const response = await axios.post(`http://13.201.75.236:3000/groups/groupmessages/${selectedGroup}`, 
                { message: message, groupName: selectedGroup }, 
                { headers: { "Authorization": `Bearer ${token}` } }
            );

            messageInput.value = '';
            appendMessage(response.data.message);
        } else if (selectedUserId) {
            console.log('Sending message to user ID:', selectedUserId);
            console.log("Sending message from username", userName);

            // Send message to server
             socket.emit('send-message', { message: message, userId: selectedUserId , username: userName});

            // Post the message to the server (for persistence)
            const response = await axios.post('http://13.201.75.236:3000/chats/message', 
                { message: message, receiverId: selectedUserId }, 
                { headers: { "Authorization": `Bearer ${token}` } }
            );

            messageInput.value = '';
            console.log("response from one to one", response.data.message);
            appendMessage(response.data.message);
        } else {
            console.error('No user or group selected');
        }
    } catch (err) {
        console.error('Error sending message:', err);
    }
});


uploadButton.addEventListener('click', async (e) => {
  e.preventDefault();
  uploadFile();
});


async function uploadFile() {
  const file = fileInput.files[0];
  if (!file) {
    console.error('No file selected');
    return;
  }

  const token = localStorage.getItem('tokenChatApp');
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('http://13.201.75.236:3000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        "Authorization": `Bearer ${token}`
      }
    });

    console.log(response.data);

    const fileUrl = response.data.fileUrl;

    if (selectedGroup) {
    socket.emit('send-message', { message: fileUrl, group: selectedGroup, username: userName });

    const response = await axios.post(`http://13.201.75.236:3000/groups/groupmessages/${selectedGroup}`, 
                { message: fileUrl, groupName: selectedGroup }, 
                { headers: { "Authorization": `Bearer ${token}` } }
            );

            messageInput.value = '';
            appendMessage(response.data.message);

  } else if (selectedUserId) {
    socket.emit('send-message', { message: fileUrl, userId: selectedUserId, username: userName });

    const response = await axios.post('http://13.201.75.236:3000/chats/message', 
                { message: fileUrl, receiverId: selectedUserId }, 
                { headers: { "Authorization": `Bearer ${token}` } }
            );

            messageInput.value = '';
            console.log("response from one to one", response.data.message);
            appendMessage(response.data.message);
  }

  // Ensure socket and userName are defined before accessing their properties
  if (socket && socket.id && userName) {
    appendMessage({ message: fileUrl, sender: { id: socket.id, name: userName }, isSent: true });
  } else {
    console.error('Socket or userName is undefined');
  }
  } catch (err) {
    console.error('Error uploading file:', err);
  }
}


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

        const response = await axios.get(`http://13.201.75.236:3000/chats/messages/${selectedUserId}`, 
            { headers: { "Authorization": `Bearer ${token}` } }
        );
        console.log('Messages fetched:', response.data);
        const messages = response.data.userMessages;

        console.log(messages);
        
        const newMessages = messages.filter(message => message.id > lastDisplayedMessageId);
        newMessages.forEach(message => {
            console.log("One to one message",message.sender.name);
            appendMessage(message);
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

        const response = await axios.get(`http://13.201.75.236:3000/groups/groupmessages/${group}`, 
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



function appendMessage(message) {
   
   const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.classList.add(message.isSent ? 'sent' : 'received');

  // Check if the message is a URL (indicating a file)
  if (message.message.startsWith('http')) {
    const link = document.createElement('a');
    link.href = message.message;
    link.textContent = 'File';
    link.target = '_blank';
    messageDiv.textContent = `${message.sender.name}: `;
    messageDiv.appendChild(link);
  } else {
    messageDiv.textContent = `${message.sender.name}: ${message.message}`;
  }

  chatBody.appendChild(messageDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
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
        const response = await axios.get('http://13.201.75.236:3000/user/', {
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
        const response = await axios.post('http://13.201.75.236:3000/groups/groupmessages', {
            name: groupName,
            users: selectedMembers
        }, {
            headers: { "Authorization": `Bearer ${localStorage.getItem('tokenChatApp')}` }
        });


        console.log('Group created successfully:', response.data);
        createGroupPopup.classList.remove('show');
        window.location.href='http://13.201.75.236:3000/chats/chatPage';
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
        const response = await axios.get('http://13.201.75.236:3000/groups/groupmessages',
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

// User Search Functionality
userSearchButton.addEventListener('click', () => {
    const searchTerm = userSearchInput.value.trim().toLowerCase();
    const userItems = usersList.getElementsByTagName('li');

    for (let i = 0; i < userItems.length; i++) {
        const userName = userItems[i].textContent.toLowerCase();
        if (userName.includes(searchTerm)) {
            userItems[i].style.display = '';
        } else {
            userItems[i].style.display = 'none';
        }
    }
});

// Group Search Functionality
groupSearchButton.addEventListener('click', () => {
    const searchTerm = groupSearchInput.value.trim().toLowerCase();
    const groupItems = groupList.getElementsByTagName('li');

    for (let i = 0; i < groupItems.length; i++) {
        const groupName = groupItems[i].textContent.toLowerCase();
        if (groupName.includes(searchTerm)) {
            groupItems[i].style.display = '';
        } else {
            groupItems[i].style.display = 'none';
        }
    }
});

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}





