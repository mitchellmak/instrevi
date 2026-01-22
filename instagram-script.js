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
    
    // Load user suggestions
    loadUserSuggestions();
});

// Load user suggestions from database
async function loadUserSuggestions() {
    console.log('Loading user suggestions...'); // Debug
    const container = document.getElementById('suggestionsContainer');
    
    if (!container) {
        console.error('Suggestions container not found!');
        return;
    }
    
    try {
        const response = await fetch('https://instrevi.onrender.com/api/users');
        console.log('API response status:', response.status); // Debug
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        console.log('Users data:', data); // Debug
        
        if (!data.users || data.users.length === 0) {
            container.innerHTML = '<p style="color: #8a8a8a; font-size: 12px; padding: 10px;">No users yet</p>';
            return;
        }
        
        container.innerHTML = '';
        
        // Get current user email to exclude from suggestions
        const currentUserEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
        console.log('Current user email:', currentUserEmail); // Debug
        
        // Color gradients for avatars
        const gradients = [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)'
        ];
        
        let count = 0;
        data.users.forEach((user, index) => {
            console.log('Processing user:', user.email, 'Current:', currentUserEmail, 'Match:', user.email === currentUserEmail); // Debug
            
            // Skip current user and limit to 3 suggestions
            if (user.email !== currentUserEmail && count < 3) {
                const username = user.email.split('@')[0];
                const initial = username.charAt(0).toUpperCase();
                const gradient = gradients[index % gradients.length];
                
                const suggestionHTML = `
                    <div class="suggestion-item">
                        <div class="avatar" style="background: ${gradient};">${initial}</div>
                        <div class="suggestion-info">
                            <p class="username">${username}</p>
                            <p class="follow-status">New user</p>
                        </div>
                        <button class="follow-btn">Follow</button>
                    </div>
                `;
                
                container.innerHTML += suggestionHTML;
                count++;
                console.log('Added user:', username, 'Count:', count); // Debug
            }
        });
        
        console.log('Total users added:', count); // Debug
        
        if (count === 0) {
            container.innerHTML = '<p style="color: #8a8a8a; font-size: 12px; padding: 10px;">No other users yet</p>';
        } else {
            // Re-attach follow button listeners
            attachFollowButtonListeners();
        }
    } catch (error) {
        console.error('Error loading suggestions:', error);
        console.error('Error details:', error.message, error.stack);
        if (container) {
            container.innerHTML = '<p style="color: #ff0000; font-size: 12px; padding: 10px;">Error: ' + error.message + '</p>';
        }
    }
}

// Attach follow button listeners
function attachFollowButtonListeners() {
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
}

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
    localStorage.removeItem('userProfile');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userProfile');
    
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

// Story click functionality
const stories = document.querySelectorAll('.story');
stories.forEach(story => {
    story.addEventListener('click', function() {
        alert('Story feature coming soon!');
    });
});
