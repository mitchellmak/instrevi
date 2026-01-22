document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form inputs
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Reset error messages
    document.getElementById('firstNameError').textContent = '';
    document.getElementById('lastNameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('dateOfBirthError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';
    
    // Validation
    let isValid = true;
    
    // First name validation
    if (!firstName) {
        document.getElementById('firstNameError').textContent = 'First name is required';
        isValid = false;
    } else if (firstName.length < 2) {
        document.getElementById('firstNameError').textContent = 'First name must be at least 2 characters';
        isValid = false;
    }
    
    // Last name validation
    if (!lastName) {
        document.getElementById('lastNameError').textContent = 'Last name is required';
        isValid = false;
    } else if (lastName.length < 2) {
        document.getElementById('lastNameError').textContent = 'Last name must be at least 2 characters';
        isValid = false;
    }
    
    // Email validation
    if (!email) {
        document.getElementById('emailError').textContent = 'Email is required';
        isValid = false;
    } else if (!isValidEmail(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email';
        isValid = false;
    }
    
    // Date of birth validation
    if (!dateOfBirth) {
        document.getElementById('dateOfBirthError').textContent = 'Date of birth is required';
        isValid = false;
    } else {
        const dob = new Date(dateOfBirth);
        const today = new Date();
        if (dob > today) {
            document.getElementById('dateOfBirthError').textContent = 'Date of birth cannot be in the future';
            isValid = false;
        }
        
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        if (age < 13) {
            document.getElementById('dateOfBirthError').textContent = 'You must be at least 13 years old';
            isValid = false;
        }
    }
    
    // Password validation
    if (!password) {
        document.getElementById('passwordError').textContent = 'Password is required';
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
        isValid = false;
    }
    
    // Confirm password validation
    if (!confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Please confirm your password';
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Disable button during submission
    const submitBtn = document.querySelector('.btn-login');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    
    // Send registration request to backend
    fetch('http://192.168.18.71:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            email: email,
            dateOfBirth: dateOfBirth,
            password: password,
            confirmPassword: confirmPassword
        })
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.token) {
            // Store token and user info in localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userProfile', JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                dateOfBirth: dateOfBirth
            }));
            
            // Show success message
            const successMsg = document.getElementById('successMessage');
            successMsg.textContent = 'Account created successfully! Redirecting to home...';
            successMsg.classList.add('show');
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'feed.html';
            }, 2000);
        } else {
            const errorMsg = data.message || 'Sign up failed';
            console.error('Sign up error:', errorMsg);
            document.getElementById('emailError').textContent = errorMsg;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        }
    })
    .catch(error => {
        console.error('Registration error:', error);
        document.getElementById('emailError').textContent = 'Network error. Make sure the server is running on 192.168.18.71:3000';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
    });
});

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

// Confirm password match validation
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    const errorElement = document.getElementById('confirmPasswordError');
    
    if (confirmPassword && password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
    } else {
        errorElement.textContent = '';
    }
});
