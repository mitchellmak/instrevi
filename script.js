document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form inputs
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Reset error messages
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    
    // Validation
    let isValid = true;
    
    // Email validation
    if (!email) {
        document.getElementById('emailError').textContent = 'Email is required';
        isValid = false;
    } else if (!isValidEmail(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email';
        isValid = false;
    }
    
    // Password validation
    if (!password) {
        document.getElementById('passwordError').textContent = 'Password is required';
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Disable button during submission
    const submitBtn = document.querySelector('.btn-login');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    // Send login request to backend
    fetch('https://instrevi.onrender.com/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Login response:', data); // Debug
        if (data.token) {
            // Store token and user info
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem('authToken', data.token);
            storage.setItem('userId', data.userId);
            storage.setItem('userEmail', email);
            
            // Store profile data if available
            if (data.profile) {
                console.log('Saving profile data:', data.profile); // Debug
                storage.setItem('userProfile', JSON.stringify(data.profile));
                redirectToHome();
            } else {
                console.log('No profile data in response, fetching from API'); // Debug
                // Fetch profile data separately
                fetch(`https://instrevi.onrender.com/api/profile?email=${encodeURIComponent(email)}`)
                    .then(res => res.json())
                    .then(profileData => {
                        if (profileData.profile) {
                            console.log('Fetched profile data:', profileData.profile);
                            storage.setItem('userProfile', JSON.stringify(profileData.profile));
                        }
                        redirectToHome();
                    })
                    .catch(err => {
                        console.error('Error fetching profile:', err);
                        redirectToHome();
                    });
            }
        } else {
            document.getElementById('emailError').textContent = data.message || 'Login failed';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        document.getElementById('emailError').textContent = 'Network error. Please try again.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    });
});

// Helper function to redirect to home
function redirectToHome() {
    // Show success message
    const successMsg = document.getElementById('successMessage');
    successMsg.textContent = 'Login successful! Redirecting...';
    successMsg.classList.add('show');
    
    // Redirect after 1 second
    setTimeout(() => {
        window.location.href = 'feed.html';
    }, 1000);
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Real-time email validation
document.getElementById('email').addEventListener('blur', function() {
    const email = this.value.trim();
    const errorElement = document.getElementById('emailError');
    
    if (email && !isValidEmail(email)) {
        errorElement.textContent = 'Please enter a valid email';
    } else {
        errorElement.textContent = '';
    }
});

// Password length validation
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const errorElement = document.getElementById('passwordError');
    
    if (password && password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters';
    } else {
        errorElement.textContent = '';
    }
});
