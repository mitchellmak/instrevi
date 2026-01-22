// Check if user is logged in
window.addEventListener('load', function() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
        // Redirect to login if no token found
        window.location.href = 'index.html';
        return;
    }
    
    // Redirect to feed page (Instagram-style home)
    window.location.href = 'feed.html';
});
