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
    const savedProfile = localStorage.getItem('userProfile') || sessionStorage.getItem('userProfile');
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
            
            updateUI(displayName, profilePicture);
            loadUserSuggestions();
        } catch (error) {
            console.error('Error parsing profile:', error);
            displayName = userEmail ? userEmail.split('@')[0] : 'User';
            updateUI(displayName, null);
            loadUserSuggestions();
        }
    } else {
        console.log('No saved profile found, fetching from API'); // Debug
        // Fetch profile from API
        if (userEmail) {
            fetch(`https://instrevi.onrender.com/api/profile?email=${encodeURIComponent(userEmail)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.profile) {
                        console.log('Fetched profile from API:', data.profile);
                        // Save it for next time
                        const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
                        storage.setItem('userProfile', JSON.stringify(data.profile));
                        
                        // Update display
                        const profile = data.profile;
                        if (profile.isAnonymous && profile.nickname) {
                            displayName = profile.nickname;
                        } else if (profile.firstName) {
                            displayName = profile.firstName;
                        } else {
                            displayName = userEmail.split('@')[0];
                        }
                        profilePicture = profile.profilePicture;
                        updateUI(displayName, profilePicture);
                    } else {
                        displayName = userEmail.split('@')[0];
                        updateUI(displayName, null);
                    }
                    loadUserSuggestions();
                })
                .catch(err => {
                    console.error('Error fetching profile:', err);
                    displayName = userEmail ? userEmail.split('@')[0] : 'User';
                    updateUI(displayName, null);
                    loadUserSuggestions();
                });
        } else {
            displayName = 'User';
            updateUI(displayName, null);
            loadUserSuggestions();
        }
    }
});

// Helper function to update UI
function updateUI(displayName, profilePicture) {
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
}

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
                // Determine display name: nickname if anonymous, otherwise first name, fallback to email username
                let displayName;
                if (user.is_anonymous && user.nickname) {
                    displayName = user.nickname;
                } else if (user.first_name) {
                    displayName = user.first_name;
                } else {
                    displayName = user.email.split('@')[0];
                }
                
                const initial = displayName.charAt(0).toUpperCase();
                const gradient = gradients[index % gradients.length];
                
                // Use profile picture if available, otherwise use gradient avatar
                let avatarHTML;
                if (user.profile_picture) {
                    avatarHTML = `<div class="avatar"><img src="${user.profile_picture}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div>`;
                } else {
                    avatarHTML = `<div class="avatar" style="background: ${gradient};">${initial}</div>`;
                }
                
                const suggestionHTML = `
                    <div class="suggestion-item">
                        ${avatarHTML}
                        <div class="suggestion-info">
                            <p class="username">${displayName}</p>
                            <p class="follow-status">New user</p>
                        </div>
                        <button class="follow-btn">Follow</button>
                    </div>
                `;
                
                container.innerHTML += suggestionHTML;
                count++;
                console.log('Added user:', displayName, 'Count:', count); // Debug
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

// Show all users modal
async function showAllUsers() {
    try {
        const response = await fetch('https://instrevi.onrender.com/api/users');
        
        if (!response.ok) {
            throw new Error('Failed to load users');
        }
        
        const data = await response.json();
        
        if (!data.users || data.users.length === 0) {
            alert('No users found');
            return;
        }
        
        // Get current user email to exclude from list
        const currentUserEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
        
        // Color gradients for avatars
        const gradients = [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)'
        ];
        
        // Create modal HTML
        let modalContent = `
            <div id="allUsersModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; border-radius: 12px; width: 90%; max-width: 500px; max-height: 80vh; overflow-y: auto; padding: 20px; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #dbdbdb; padding-bottom: 15px;">
                        <h2 style="margin: 0; font-size: 18px; font-weight: 600;">All Users</h2>
                        <button onclick="closeAllUsersModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #262626; padding: 0; width: 30px; height: 30px;">&times;</button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
        `;
        
        // Add all users except current user
        data.users.forEach((user, index) => {
            if (user.email !== currentUserEmail) {
                // Determine display name: nickname if anonymous, otherwise first name, fallback to email username
                let displayName;
                if (user.is_anonymous && user.nickname) {
                    displayName = user.nickname;
                } else if (user.first_name) {
                    displayName = user.first_name;
                } else {
                    displayName = user.email.split('@')[0];
                }
                
                const initial = displayName.charAt(0).toUpperCase();
                const gradient = gradients[index % gradients.length];
                
                let avatarHTML;
                if (user.profile_picture) {
                    avatarHTML = `<div style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; flex-shrink: 0;"><img src="${user.profile_picture}" style="width: 100%; height: 100%; object-fit: cover;"></div>`;
                } else {
                    avatarHTML = `<div style="width: 44px; height: 44px; border-radius: 50%; background: ${gradient}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 18px; flex-shrink: 0;">${initial}</div>`;
                }
                
                modalContent += `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            ${avatarHTML}
                            <div>
                                <p style="margin: 0; font-weight: 600; font-size: 14px; color: #262626;">${displayName}</p>
                                <p style="margin: 0; font-size: 12px; color: #8e8e8e;">New user</p>
                            </div>
                        </div>
                        <button onclick="toggleFollow(this)" style="background: #0095f6; color: white; border: none; border-radius: 8px; padding: 7px 16px; font-weight: 600; font-size: 14px; cursor: pointer;">Follow</button>
                    </div>
                `;
            }
        });
        
        modalContent += `
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalContent);
        
    } catch (error) {
        console.error('Error loading all users:', error);
        alert('Failed to load users. Please try again.');
    }
}

// Close modal function
window.closeAllUsersModal = function() {
    const modal = document.getElementById('allUsersModal');
    if (modal) {
        modal.remove();
    }
}

// Toggle follow in modal
window.toggleFollow = function(button) {
    if (button.textContent === 'Follow') {
        button.textContent = 'Following';
        button.style.background = 'transparent';
        button.style.color = '#262626';
        button.style.border = '1px solid #dbdbdb';
    } else {
        button.textContent = 'Follow';
        button.style.background = '#0095f6';
        button.style.color = 'white';
        button.style.border = 'none';
    }
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

// See All users functionality
document.addEventListener('DOMContentLoaded', function() {
    const seeAllLink = document.querySelector('.suggestions-header a');
    if (seeAllLink) {
        seeAllLink.addEventListener('click', function(e) {
            e.preventDefault();
            showAllUsers();
        });
    }
    
    // Review It button functionality
    const reviewItBtn = document.getElementById('reviewItBtn');
    if (reviewItBtn) {
        reviewItBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openReviewModal();
        });
    }
    
    // Image upload handler
    const reviewImageInput = document.getElementById('reviewImageInput');
    if (reviewImageInput) {
        reviewImageInput.addEventListener('change', handleImageUpload);
    }
    
    // Review form submission
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
});

// Review Modal Functions
let selectedReviewType = '';
let uploadedImageData = null;

function openReviewModal() {
    document.getElementById('reviewModal').style.display = 'block';
    document.getElementById('imageUploadStep').style.display = 'block';
    document.getElementById('reviewTypeStep').style.display = 'none';
    document.getElementById('reviewFormStep').style.display = 'none';
    selectedReviewType = '';
    uploadedImageData = null;
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
    document.getElementById('reviewImageInput').value = '';
    document.getElementById('imagePreview').innerHTML = `
        <i class="fas fa-camera" style="font-size: 48px; color: #8e8e8e; margin-bottom: 16px;"></i>
        <p style="color: #262626; font-weight: 600; margin: 0 0 8px 0;">Add Photo or Video</p>
        <p style="color: #8e8e8e; font-size: 14px; margin: 0;">Click to open camera or gallery</p>
    `;
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        uploadedImageData = event.target.result;
        const imagePreview = document.getElementById('imagePreview');
        
        if (file.type.startsWith('image/')) {
            imagePreview.innerHTML = `<img src="${uploadedImageData}" style="max-width: 100%; max-height: 400px; border-radius: 8px;">`;
        } else if (file.type.startsWith('video/')) {
            imagePreview.innerHTML = `<video src="${uploadedImageData}" controls style="max-width: 100%; max-height: 400px; border-radius: 8px;"></video>`;
        }
        
        // Show review type selection
        document.getElementById('reviewTypeStep').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function selectReviewType(type) {
    selectedReviewType = type;
    
    // Highlight selected button
    document.querySelectorAll('.review-type-btn').forEach(btn => {
        btn.style.borderColor = '#dbdbdb';
        btn.style.background = 'white';
    });
    event.target.closest('.review-type-btn').style.borderColor = '#0095f6';
    event.target.closest('.review-type-btn').style.background = '#e7f3ff';
    
    // Show form fields based on type
    showReviewForm(type);
}

function showReviewForm(type) {
    const formFields = document.getElementById('reviewFormFields');
    let fieldsHTML = '';
    
    if (type === 'items') {
        fieldsHTML = `
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Item Description</label>
                <input type="text" name="itemDescription" required style="width: 100%; padding: 10px; border: 1px solid #dbdbdb; border-radius: 6px; font-size: 14px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Brand</label>
                <input type="text" name="brand" required style="width: 100%; padding: 10px; border: 1px solid #dbdbdb; border-radius: 6px; font-size: 14px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Review Description</label>
                <textarea name="reviewDescription" required rows="4" style="width: 100%; padding: 10px; border: 1px solid #dbdbdb; border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Rating</label>
                <div class="star-rating" style="font-size: 32px;">
                    ${createStarRating()}
                </div>
            </div>
        `;
    } else if (type === 'food') {
        fieldsHTML = `
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Food Description</label>
                <input type="text" name="foodDescription" required style="width: 100%; padding: 10px; border: 1px solid #dbdbdb; border-radius: 6px; font-size: 14px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Shop Name</label>
                <input type="text" name="shopName" required style="width: 100%; padding: 10px; border: 1px solid #dbdbdb; border-radius: 6px; font-size: 14px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Shop Address</label>
                <input type="text" name="shopAddress" required style="width: 100%; padding: 10px; border: 1px solid #dbdbdb; border-radius: 6px; font-size: 14px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Review Description</label>
                <textarea name="reviewDescription" required rows="4" style="width: 100%; padding: 10px; border: 1px solid #dbdbdb; border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Rating</label>
                <div class="star-rating" style="font-size: 32px;">
                    ${createStarRating()}
                </div>
            </div>
        `;
    } else if (type === 'service') {
        fieldsHTML = `
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Shop Name</label>
                <input type="text" name="shopName" required style="width: 100%; padding: 10px; border: 1px solid #dbdbdb; border-radius: 6px; font-size: 14px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Shop Address</label>
                <input type="text" name="shopAddress" required style="width: 100%; padding: 10px; border: 1px solid #dbdbdb; border-radius: 6px; font-size: 14px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Review Description</label>
                <textarea name="reviewDescription" required rows="4" style="width: 100%; padding: 10px; border: 1px solid #dbdbdb; border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Rating</label>
                <div class="star-rating" style="font-size: 32px;">
                    ${createStarRating()}
                </div>
            </div>
        `;
    } else if (type === 'unboxing') {
        fieldsHTML = `
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Item Description</label>
                <input type="text" name="itemDescription" required style="width: 100%; padding: 10px; border: 1px solid #dbdbdb; border-radius: 6px; font-size: 14px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Brand</label>
                <input type="text" name="brand" required style="width: 100%; padding: 10px; border: 1px solid #dbdbdb; border-radius: 6px; font-size: 14px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px;">Review Description</label>
                <textarea name="reviewDescription" required rows="4" style="width: 100%; padding: 10px; border: 1px solid #dbdbdb; border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
            </div>
        `;
    }
    
    formFields.innerHTML = fieldsHTML;
    document.getElementById('reviewFormStep').style.display = 'block';
    
    // Initialize star rating functionality
    if (type !== 'unboxing') {
        initStarRating();
    }
}

function createStarRating() {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="far fa-star" data-rating="${i}" style="cursor: pointer; color: #dbdbdb; margin-right: 4px;"></i>`;
    }
    return stars;
}

function initStarRating() {
    const stars = document.querySelectorAll('.star-rating i');
    let selectedRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            updateStars(selectedRating);
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            updateStars(rating);
        });
    });
    
    document.querySelector('.star-rating').addEventListener('mouseleave', function() {
        updateStars(selectedRating);
    });
    
    function updateStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'fas fa-star';
                star.style.color = '#ffc107';
            } else {
                star.className = 'far fa-star';
                star.style.color = '#dbdbdb';
            }
        });
    }
    
    // Store rating in hidden input
    const ratingInput = document.createElement('input');
    ratingInput.type = 'hidden';
    ratingInput.name = 'rating';
    ratingInput.value = selectedRating;
    document.getElementById('reviewForm').appendChild(ratingInput);
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            ratingInput.value = selectedRating;
        });
    });
}

function handleReviewSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const profile = JSON.parse(localStorage.getItem('profile') || sessionStorage.getItem('profile') || '{}');
    
    if (!profile.id) {
        alert('Please log in to submit a review');
        return;
    }
    
    const reviewData = {
        userId: profile.id,
        type: selectedReviewType,
        image: uploadedImageData
    };
    
    // Collect form fields
    for (let [key, value] of formData.entries()) {
        reviewData[key] = value;
    }
    
    console.log('Submitting review:', reviewData);
    
    // Send to backend API
    fetch('https://instrevi.onrender.com/api/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Review submitted successfully!');
            closeReviewModal();
            // Optionally reload the feed to show the new review
            // location.reload();
        } else {
            alert('Failed to submit review: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Review submission error:', error);
        alert('Failed to submit review. Please try again.');
    });
}

// Make functions global
window.closeReviewModal = closeReviewModal;
window.selectReviewType = selectReviewType;
