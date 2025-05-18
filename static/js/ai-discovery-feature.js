/**
 * AI Discovery Feature for StreamSense
 * Handles the process of getting AI-powered recommendations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const aiDiscoveryBtn = document.getElementById('aiDiscoveryBtn');
    const aiDiscoveryModal = new bootstrap.Modal(document.getElementById('aiDiscoveryModal'), {
        backdrop: 'static'
    });
    const aiDiscoveryForm = document.getElementById('aiDiscoveryForm');
    const aiPromptInput = document.getElementById('aiPrompt');

    // Initialize results modal
    const aiResultsModal = new bootstrap.Modal(document.getElementById('aiResultsModal'), {
        backdrop: 'static'
    });
    const aiResultsContent = document.getElementById('aiResultsContent');

    // Event listeners
    aiDiscoveryBtn?.addEventListener('click', function() {
        aiDiscoveryModal.show();
    });

    aiDiscoveryForm?.addEventListener('submit', function(e) {
        e.preventDefault();

        const prompt = aiPromptInput.value.trim();
        if (!prompt) {
            return;
        }

        // Show loading state
        const submitButton = aiDiscoveryForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
        submitButton.disabled = true;

        // Close current modal and open results modal with loading state
        setTimeout(() => {
            aiDiscoveryModal.hide();

            // Show loading state in results modal
            aiResultsContent.innerHTML = `
                <div class="spinner-container">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="loading-message">Our AI is analyzing your request...</p>
                </div>
            `;
            aiResultsModal.show();

            // Make AJAX request to backend
            fetch('/api/ai-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('API request failed');
                }
                return response.json();
            })
            .then(data => {
                // Display results
                displayResults(data, prompt);
            })
            .catch(error => {
                console.error('Error fetching AI recommendations:', error);
                // Show error message
                aiResultsContent.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        Sorry, we couldn't process your request. Please try again later.
                    </div>
                `;
            })
            .finally(() => {
                // Reset form
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                aiPromptInput.value = '';
            });
        }, 800);
    });

    // Function to display results
    function displayResults(data, prompt) {
        const { movies = [], shows = [] } = data;

        // Build HTML for results
        let html = `
            <div class="user-prompt mb-4">
                <strong>Your request:</strong> "${prompt}"
            </div>
        `;

        // Movie recommendations section
        html += `
            <div class="recommendation-section mb-4">
                <h4 class="recommendation-title mb-3">Recommended Movies</h4>
                <div class="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3">
        `;

        if (movies.length === 0) {
            html += `<div class="col-12"><p class="text-muted">No movie recommendations found for your query.</p></div>`;
        } else {
            movies.forEach(movie => {
                html += `
                    <div class="col">
                        <div class="media-card">
                            <div class="position-relative">
                                <img 
                                    src="${movie.poster_url || 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg'}" 
                                    alt="${movie.title}" 
                                    class="media-poster"
                                    onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';"
                                >
                                <div class="media-actions">
                                    <button class="action-btn like-btn" data-id="${movie.id}" data-type="movie">
                                        <i class="bi bi-heart"></i>
                                    </button>
                                    <button class="action-btn watchlist-btn" data-id="${movie.id}" data-type="movie">
                                        <i class="bi bi-plus-lg"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="media-info">
                                <h3 class="media-title">${movie.title}</h3>
                                <div class="media-rating">
                                    <span class="rating-star"><i class="bi bi-star-fill"></i></span>
                                    <span>${movie.rating ? movie.rating.toFixed(1) : '4.0'}</span>
                                </div>
                                <div class="media-year">${movie.year || 'Unknown'}</div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;

        // TV show recommendations section
        html += `
            <div class="recommendation-section">
                <h4 class="recommendation-title mb-3">Recommended TV Shows</h4>
                <div class="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3">
        `;

        if (shows.length === 0) {
            html += `<div class="col-12"><p class="text-muted">No TV show recommendations found for your query.</p></div>`;
        } else {
            shows.forEach(show => {
                html += `
                    <div class="col">
                        <div class="media-card">
                            <div class="position-relative">
                                <img 
                                    src="${show.poster_url || 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg'}" 
                                    alt="${show.title}" 
                                    class="media-poster"
                                    onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';"
                                >
                                <div class="media-actions">
                                    <button class="action-btn like-btn" data-id="${show.id}" data-type="tvshow">
                                        <i class="bi bi-heart"></i>
                                    </button>
                                    <button class="action-btn watchlist-btn" data-id="${show.id}" data-type="tvshow">
                                        <i class="bi bi-plus-lg"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="media-info">
                                <h3 class="media-title">${show.title}</h3>
                                <div class="media-rating">
                                    <span class="rating-star"><i class="bi bi-star-fill"></i></span>
                                    <span>${show.rating ? show.rating.toFixed(1) : '4.0'}</span>
                                </div>
                                <div class="media-year">${show.year || 'Unknown'}</div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;

        // Update content
        aiResultsContent.innerHTML = html;

        // Set up event listeners for like and watchlist buttons
        setupActionButtons();
    }

    // Function to set up event listeners for action buttons
    function setupActionButtons() {
        // Like buttons
        document.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', function() {
                const icon = this.querySelector('i');
                icon.classList.toggle('bi-heart');
                icon.classList.toggle('bi-heart-fill');
                this.classList.toggle('active');

                // You would normally send an API request here
                console.log(`Toggled like for ${this.dataset.type} with ID ${this.dataset.id}`);
            });
        });

        // Watchlist buttons
        document.querySelectorAll('.watchlist-btn').forEach(button => {
            button.addEventListener('click', function() {
                const icon = this.querySelector('i');
                icon.classList.toggle('bi-plus-lg');
                icon.classList.toggle('bi-check-lg');
                this.classList.toggle('active');

                // You would normally send an API request here
                console.log(`Toggled watchlist for ${this.dataset.type} with ID ${this.dataset.id}`);
            });
        });
    }
});