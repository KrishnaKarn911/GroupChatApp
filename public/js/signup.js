const form = document.getElementById('signup');

form.addEventListener('submit', async(e)=>{
    e.preventDefault();
    console.log('In Signup form');
    const name=document.getElementById('name').value;
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    const confirmPassword=document.getElementById('confirm-password').value;

   
    const messageElement = document.getElementById('message');
    messageElement.style.display = 'none';
    messageElement.textContent = '';

    if (password !== confirmPassword) {
        messageElement.textContent = 'Passwords do not match.';
        messageElement.style.display = 'block';
        return;
    }

    try {

            
        const response = await axios.post('http://13.201.75.236:3000/user/signup', {
            name: name,
            email: email,
            password: password
        });

    
     
        if (response.status === 201) {
            alert('Successfully Registered');
            window.location.href = 'http://13.201.75.236:3000/user/login';
        } else {
            messageElement.textContent = response.message;
            messageElement.style.display = 'block';
        }
  
        
    } catch (err) {
        console.log(err);
        messageElement.textContent = err.response ? err.response.data.message : 'An error occurred. Please try again.';
        messageElement.style.display = 'block';
    }
});


