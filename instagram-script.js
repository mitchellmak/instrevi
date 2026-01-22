// Check if user is logged in
window.addEventListener('load', function() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    
    if (!token) {
        // Redirect to login if no token found
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Loading profile data...'); // Debug
    
    // Load user profile data
    const savedProfile = localStorage.getItem('userProfile');
    let displayName = '';
    let profilePicture = null;
    
    if (savedProfile) {
        try {
            const profile = JSON.parse(savedProfile);
            console.log('Profile loaded:', profile); // Debug
            
            // Determine display name based on anonymous mode
            if (profile.isAnonymous && profile.nickname) {
                // If anonymous mode is on, show nickname
                displayName = profile.nickname;
            } else if (profile.firstName) {
                // If anonymous mode is off, show first name
                displayName = profile.firstName;
            } else if (userEmail) {
                displayName = userEmail.split('@')[0];
            }
            
            profilePicture = profile.profilePicture;
        } catch (error) {
            console.error('Error parsing profile:', error);
            displayName = userEmail ? userEmail.split('@')[0] : 'User';
        }
    } else {
        console.log('No saved profile found'); // Debug
        displayName = userEmail ? userEmail.split('@')[0] : 'User';
    }
    
    // Update header with user information
    const usernameElement = document.getElementById('headerUsername');
    if (usernameElement && displayName) {
        usernameElement.textContent = displayName;
        console.log('Username updated to:', displayName); // Debug
    }
    
    // Update profile avatar if picture exists
    if (profilePicture) {
        const avatarElement = document.getElementById('headerProfileAvatar');
        if (avatarElement) {
            avatarElement.innerHTML = `<img src="${profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            console.log('Avatar updated'); // Debug
        }
    } else {
        console.log('No profile picture found'); // Debug
    }
});

// Dropdown menu toggle
document.querySelector('.dropdown-toggle').addEventListener('click', function() {
    const menu = document.querySelector('.dropdown-menu');
    menu.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.dropdown');
    if (!dropdown.contains(event.target)) {
        document.querySelector('.dropdown-menu').classList.remove('show');
    }
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    // Clear stored data from both storage types
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    
    // Redirect to login page
    window.location.href = 'index.html';
});

// Like button toggle
const likeButtons = document.querySelectorAll('.action-buttons button:first-child');
likeButtons.forEach(button => {
    button.addEventListener('click', function() {
        this.classList.toggle('liked');
        if (this.classList.contains('liked')) {
            this.innerHTML = '<i class="fas fa-heart"></i>';
            this.style.color = '#ed4956';
        } else {
            this.innerHTML = '<i class="far fa-heart"></i>';
            this.style.color = '#262626';
        }
    });
});

// Follow button functionality
const followButtons = document.querySelectorAll('.follow-btn');
followButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (this.textContent === 'Follow') {
            this.textContent = 'Following';
            this.style.color = '#262626';
        } else {
            this.textContent = 'Follow';
            this.style.color = '#0a66c2';
        }
    });
});

// Story click functionality
const stories = document.querySelectorAll('.story');
stories.forEach(story => {
    story.addEventListener('click', function() {
        alert('Story feature coming soon!');
    });
});
