$(document).ready(function() {
    // Prevent clicks on action buttons from triggering the card link
    $('.action-btn').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
    });

    // Get CSRF token
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
    $(document).on('click', '.like-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const button = $(this);
        const itemId = button.data('id');
        const itemType = button.data('type');
        const itemTitle = button.data('title');
        const icon = button.find('i');

        $.ajax({
            url: '/toggle-like/',
            method: 'POST',
            data: {
                'item_id': itemId,
                'item_type': itemType,
                'item_title': itemTitle,
                'csrfmiddlewaretoken': csrftoken
            },
            success: function(data) {
                if (data.is_liked) {
                    icon.removeClass('bi-heart').addClass('bi-heart-fill');
                } else {
                    icon.removeClass('bi-heart-fill').addClass('bi-heart');
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    window.location.href = '/accounts/login/?next=' + window.location.pathname;
                } else {
                    console.error('Error:', xhr.responseText);
                }
            }
        });
    });

    // Handle watchlist button clicks
    $(document).on('click', '.watchlist-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const button = $(this);
        const itemId = button.data('id');
        const itemType = button.data('type');
        const itemTitle = button.data('title');
        const icon = button.find('i');

        $.ajax({
            url: '/toggle-watchlist/',
            method: 'POST',
            data: {
                'item_id': itemId,
                'item_type': itemType,
                'item_title': itemTitle,
                'csrfmiddlewaretoken': csrftoken
            },
            success: function(data) {
                if (data.in_watchlist) {
                    icon.removeClass('bi-plus-lg').addClass('bi-plus-lg-circle-fill');
                } else {
                    icon.removeClass('bi-plus-lg-circle-fill').addClass('bi-plus-lg');
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    window.location.href = '/accounts/login/?next=' + window.location.pathname;
                } else {
                    console.error('Error:', xhr.responseText);
                }
            }
        });
    });

    // Add loading state for images
    $('.media-poster').on('load', function() {
        $(this).removeClass('loading');
    }).on('error', function() {
        $(this).removeClass('loading');
        $(this).attr('src', '/static/images/no-poster.jpg');
    }).each(function() {
        if (this.complete) {
            $(this).removeClass('loading');
        } else {
            $(this).addClass('loading');
        }
    });
}); 