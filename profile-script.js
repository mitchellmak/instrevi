// Check if user is logged in
window.addEventListener('load', function() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    
    if (!token) {
        // Redirect to login if no token found
        window.location.href = 'index.html';
        return;
    }
    
    // Load user data if it exists
    loadUserProfile(userEmail);
    
    // Initialize profile picture upload
    initializeProfilePictureUpload();
    
    // Initialize password toggles
    initializePasswordToggles();
    
    // Initialize form submission
    initializeFormSubmission();
    
    // Initialize edit again button
    initializeEditAgainButton();
    
    // Initialize logout button
    initializeLogoutButton();
});

// Load user profile data
function loadUserProfile(userEmail) {
    // Try to load saved profile data from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        document.getElementById('firstName').value = profile.firstName || '';
        document.getElementById('lastName').value = profile.lastName || '';
        document.getElementById('nickname').value = profile.nickname || '';
        document.getElementById('email').value = profile.email || userEmail || '';
        document.getElementById('dateOfBirth').value = profile.dateOfBirth || '';
        document.getElementById('isAnonymous').checked = profile.isAnonymous || false;
        
        // Load profile picture if exists
        if (profile.profilePicture) {
            updateProfileAvatars(profile.profilePicture);
        }
    } else {
        // Set email from session
        document.getElementById('email').value = userEmail || '';
    }
}

// Profile picture upload handling
function initializeProfilePictureUpload() {
    const uploadAvatar = document.getElementById('uploadAvatar');
    const profilePictureInput = document.getElementById('profilePicture');
    
    if (!uploadAvatar || !profilePictureInput) {
        console.error('Upload elements not found');
        return;
    }

    uploadAvatar.addEventListener('click', () => {
        profilePictureInput.click();
    });

    // Drag and drop
    uploadAvatar.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadAvatar.style.backgroundColor = '#e0e0e0';
    });

    uploadAvatar.addEventListener('dragleave', () => {
        uploadAvatar.style.backgroundColor = '#f5f5f5';
    });

    uploadAvatar.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadAvatar.style.backgroundColor = '#f5f5f5';
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            handleProfilePictureFile(file);
        }
    });

    profilePictureInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            handleProfilePictureFile(file);
        }
    });
}

function handleProfilePictureFile(file) {
    const profilePictureInput = document.getElementById('profilePicture');
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('profilePictureError', 'Please upload an image file');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('profilePictureError', 'Image size must be less than 5MB');
        return;
    }
    
    // Clear error
    document.getElementById('profilePictureError').textContent = '';
    document.getElementById('profilePictureError').classList.remove('show');
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Store in hidden input for form submission
        profilePictureInput.dataset.imageData = imageData;
        
        // Update avatar preview
        updateProfileAvatars(imageData);
    };
    reader.readAsDataURL(file);
}

function updateProfileAvatars(imageData) {
    // Update upload avatar
    const uploadAvatar = document.getElementById('uploadAvatar');
    if (uploadAvatar) {
        uploadAvatar.innerHTML = `<img src="${imageData}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
    }
    
    // Update main avatar
    const mainAvatar = document.getElementById('profileAvatarDisplay');
    if (mainAvatar) {
        mainAvatar.innerHTML = `<img src="${imageData}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    }
}

// Initialize upload functionality
initializeProfilePictureUpload();

// Toggle password visibility
document.getElementById('togglePassword').addEventListener('click', function(e) {
    e.preventDefault();
    togglePasswordField('password', 'togglePassword');
});

document.getElementById('toggleConfirmPassword').addEventListener('click', function(e) {
    e.preventDefault();
    togglePasswordField('confirmPassword', 'toggleConfirmPassword');
});

function togglePasswordField(fieldId, buttonId) {
    const input = document.getElementById(fieldId);
    const button = document.getElementById(buttonId);
    
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        button.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Form submission
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get old profile data to compare changes
    const savedProfile = localStorage.getItem('userProfile');
    const oldProfile = savedProfile ? JSON.parse(savedProfile) : {};
    
    // Get form inputs
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const nickname = document.getElementById('nickname').value.trim();
    const email = document.getElementById('email').value.trim();
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const isAnonymous = document.getElementById('isAnonymous').checked;
    const profilePictureInput = document.getElementById('profilePicture');
    let profilePicture = profilePictureInput ? profilePictureInput.dataset.imageData : null;
    
    // If no new picture uploaded, get existing one from localStorage
    if (!profilePicture) {
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            profilePicture = profile.profilePicture || null;
        }
    }
    
    // Track which fields were updated
    const updatedFields = {
        firstName: oldProfile.firstName !== firstName,
        lastName: oldProfile.lastName !== lastName,
        nickname: oldProfile.nickname !== nickname,
        email: oldProfile.email !== email,
        dateOfBirth: oldProfile.dateOfBirth !== dateOfBirth,
        isAnonymous: oldProfile.isAnonymous !== isAnonymous,
        profilePicture: profilePictureInput && profilePictureInput.dataset.imageData ? true : false
    };
    
    // Reset error messages
    clearErrorMessages();
    
    // Validation
    let isValid = true;
    
    // First name validation
    if (!firstName) {
        showError('firstNameError', 'First name is required');
        isValid = false;
    } else if (firstName.length < 2) {
        showError('firstNameError', 'First name must be at least 2 characters');
        isValid = false;
    }
    
    // Last name validation
    if (!lastName) {
        showError('lastNameError', 'Last name is required');
        isValid = false;
    } else if (lastName.length < 2) {
        showError('lastNameError', 'Last name must be at least 2 characters');
        isValid = false;
    }
    
    // Nickname validation (if anonymous is checked)
    if (isAnonymous && !nickname) {
        showError('nicknameError', 'Nickname is required when using anonymous mode');
        isValid = false;
    } else if (nickname && nickname.length < 2) {
        showError('nicknameError', 'Nickname must be at least 2 characters');
        isValid = false;
    }
    
    // Email validation
    if (!email) {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email');
        isValid = false;
    }
    
    // Date of birth validation
    if (!dateOfBirth) {
        showError('dateOfBirthError', 'Date of birth is required');
        isValid = false;
    } else {
        const dob = new Date(dateOfBirth);
        const today = new Date();
        if (dob > today) {
            showError('dateOfBirthError', 'Date of birth cannot be in the future');
            isValid = false;
        }
        
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        if (age < 13) {
            showError('dateOfBirthError', 'You must be at least 13 years old');
            isValid = false;
        }
    }
    
    // Password validation (only if password is provided)
    if (password || confirmPassword) {
        if (!password) {
            showError('passwordError', 'Please enter a new password');
            isValid = false;
        } else if (password.length < 6) {
            showError('passwordError', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (!confirmPassword) {
            showError('confirmPasswordError', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }
    }
    
    if (!isValid) {
        return;
    }
    
    // Save profile data
    saveProfile(firstName, lastName, nickname, email, dateOfBirth, password, isAnonymous, profilePicture, updatedFields);
});

// Save profile data
function saveProfile(firstName, lastName, nickname, email, dateOfBirth, password, isAnonymous, profilePicture, updatedFields) {
    // Disable button during submission
    const submitBtn = document.querySelector('.btn-save');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    // Prepare update data
    const updateData = {
        firstName: firstName,
        lastName: lastName,
        nickname: nickname,
        email: email,
        dateOfBirth: dateOfBirth,
        isAnonymous: isAnonymous
    };
    
    if (password) {
        updateData.password = password;
    }
    
    if (profilePicture) {
        updateData.profilePicture = profilePicture;
    }
    
    // Send update request to backend
    fetch('https://instrevi.onrender.com/api/updateProfile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || sessionStorage.getItem('authToken'))
        },
        body: JSON.stringify(updateData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.message === 'Profile updated successfully') {
            // Save profile locally as well
            const profileData = {
                firstName: firstName,
                lastName: lastName,
                nickname: nickname,
                email: email,
                dateOfBirth: dateOfBirth,
                isAnonymous: isAnonymous
            };
            
            if (profilePicture) {
                profileData.profilePicture = profilePicture;
            }
            
            localStorage.setItem('userProfile', JSON.stringify(profileData));
            
            // Show profile details
            displayProfileDetails(firstName, lastName, nickname, email, dateOfBirth, isAnonymous, profilePicture, updatedFields);
            
            // Clear password fields
            document.getElementById('password').value = '';
            document.getElementById('confirmPassword').value = '';
            
            // Hide form and show details
            document.getElementById('profileForm').style.display = 'none';
            document.getElementById('profileDetailsSection').style.display = 'block';
        } else {
            showError('firstNameError', data.message || 'Failed to update profile');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
        }
    })
    .catch(error => {
        console.error('Profile update error:', error);
        // Save locally even if backend fails
        const profileData = {
            firstName: firstName,
            lastName: lastName,
            nickname: nickname,
            email: email,
            dateOfBirth: dateOfBirth,
            isAnonymous: isAnonymous
        };
        
        if (profilePicture) {
            profileData.profilePicture = profilePicture;
        }
        
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        
        // Show profile details
        displayProfileDetails(firstName, lastName, nickname, email, dateOfBirth, isAnonymous, profilePicture, updatedFields);
        
        // Hide form and show details
        document.getElementById('profileForm').style.display = 'none';
        document.getElementById('profileDetailsSection').style.display = 'block';
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
    });
}

// Display profile details
function displayProfileDetails(firstName, lastName, nickname, email, dateOfBirth, isAnonymous, profilePicture, updatedFields) {
    // Display name
    const displayName = isAnonymous ? (nickname || 'Anonymous User') : `${firstName} ${lastName}`;
    const nameUpdated = updatedFields && (updatedFields.firstName || updatedFields.lastName || updatedFields.isAnonymous);
    document.getElementById('detailDisplayName').innerHTML = displayName + (nameUpdated ? ' <span class="updated-badge">* updated</span>' : '');
    
    // Nickname
    const nicknameUpdated = updatedFields && updatedFields.nickname;
    document.getElementById('detailNickname').innerHTML = (nickname || '-') + (nicknameUpdated ? ' <span class="updated-badge">* updated</span>' : '');
    
    // Email
    const emailUpdated = updatedFields && updatedFields.email;
    document.getElementById('detailEmail').innerHTML = email + (emailUpdated ? ' <span class="updated-badge">* updated</span>' : '');
    
    // Date of birth
    const dobDate = new Date(dateOfBirth);
    const formattedDob = dobDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const dobUpdated = updatedFields && updatedFields.dateOfBirth;
    document.getElementById('detailDateOfBirth').innerHTML = formattedDob + (dobUpdated ? ' <span class="updated-badge">* updated</span>' : '');
    
    // Anonymous status
    const anonymousUpdated = updatedFields && updatedFields.isAnonymous;
    document.getElementById('detailAnonymous').innerHTML = (isAnonymous ? 'Yes (showing nickname)' : 'No') + (anonymousUpdated ? ' <span class="updated-badge">* updated</span>' : '');
    
    // Profile picture
    if (profilePicture) {
        const pictureUpdated = updatedFields && updatedFields.profilePicture;
        document.getElementById('detailAvatarDisplay').innerHTML = `<img src="${profilePicture}" style="width: 100%; height: 100%; object-fit: cover;">` + (pictureUpdated ? '<div class="updated-badge" style="margin-top: 0.5rem;">* updated</div>' : '');
    }
}

// Edit again button
document.getElementById('editAgainBtn').addEventListener('click', function() {
    // Hide details section
    document.getElementById('profileDetailsSection').style.display = 'none';
    // Show form
    document.getElementById('profileForm').style.display = 'flex';
});

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearErrorMessages() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => {
        el.textContent = '';
        el.classList.remove('show');
    });
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    // Clear stored credentials
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userProfile');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    
    // Redirect to login page
    window.location.href = 'index.html';
});
