document.addEventListener('DOMContentLoaded', function() {
    // Get CSRF token from cookie
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    // Handle like button clicks
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const itemId = this.dataset.id;
            const itemType = this.dataset.type;
            const itemTitle = this.closest('.media-card').querySelector('.media-title').textContent;
            const icon = this.querySelector('i');

            fetch('api/toggle-like/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': csrftoken
                },
                body: `item_id=${itemId}&item_type=${itemType}&item_title=${encodeURIComponent(itemTitle)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.is_liked) {
                    icon.classList.remove('bi-heart');
                    icon.classList.add('bi-heart-fill');
                } else {
                    icon.classList.remove('bi-heart-fill');
                    icon.classList.add('bi-heart');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    });

    // Handle watchlist button clicks
    document.querySelectorAll('.watchlist-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const itemId = this.dataset.id;
            const itemType = this.dataset.type;
            const itemTitle = this.closest('.media-card').querySelector('.media-title').textContent;
            const icon = this.querySelector('i');

            fetch('api/toggle-watchlist/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': csrftoken
                },
                body: `item_id=${itemId}&item_type=${itemType}&item_title=${encodeURIComponent(itemTitle)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.in_watchlist) {
                    icon.classList.remove('bi-plus-lg');
                    icon.classList.add('bi-plus-lg-circle-fill');
                } else {
                    icon.classList.remove('bi-plus-lg-circle-fill');
                    icon.classList.add('bi-plus-lg');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    });
}); 