/**
 * AI Discovery Feature
 * Handles the AI-powered movie and TV show recommendations
 */

class AIDiscovery {
    constructor() {
        this.aiDiscoveryForm = document.getElementById('aiDiscoveryForm');
        this.aiPromptInput = document.getElementById('aiPrompt');
        this.aiDiscoveryModal = document.getElementById('aiDiscoveryModal');
        this.aiResultsModal = document.getElementById('aiResultsModal');
        this.modalInstance = null;
        this.resultsModalInstance = null;

        this.init();
    }

    init() {
        if (this.aiDiscoveryForm) {
            this.aiDiscoveryForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // Initialize Bootstrap modals
        if (this.aiDiscoveryModal) {
            this.modalInstance = new bootstrap.Modal(this.aiDiscoveryModal);
        }

        if (this.aiResultsModal) {
            this.resultsModalInstance = new bootstrap.Modal(this.aiResultsModal);
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const prompt = this.aiPromptInput.value.trim();

        if (!prompt) {
            return;
        }

        // Show loading state in the current modal
        const submitButton = this.aiDiscoveryForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
        submitButton.disabled = true;

        // Close the discovery modal and show the results modal with loading state
        setTimeout(() => {
            this.modalInstance.hide();

            // Show the results modal with loading state
            document.getElementById('aiResultsContent').innerHTML = `
                <div class="spinner-container">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="loading-message">Our AI is searching for the perfect recommendations...</p>
                </div>
            `;

            this.resultsModalInstance.show();

            // Make AJAX request to get AI recommendations
            this.getAIRecommendations(prompt)
                .then(data => {
                    this.displayRecommendations(prompt, data);
                })
                .catch(error => {
                    console.error('Error fetching AI recommendations:', error);
                    document.getElementById('aiResultsContent').innerHTML = `
                        <div class="alert alert-danger" role="alert">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            Sorry, we encountered an error while processing your request. Please try again later.
                        </div>
                    `;
                })
                .finally(() => {
                    // Reset the discovery form
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                    this.aiPromptInput.value = '';
                });
        }, 500);
    }

    getAIRecommendations(prompt) {
        // In a real implementation, this would call a backend API that connects to DeepSeek
        // Here, we're using the mock API service
        return new Promise((resolve, reject) => {
            fetch('/api/ai-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: prompt })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => resolve(data))
            .catch(error => reject(error));
        });
    }

    displayRecommendations(prompt, data) {
        // Display the AI recommendations in the results modal
        const movies = data.movies || [];
        const shows = data.shows || [];

        let content = `
            <div class="user-prompt">
                <p>"${prompt}"</p>
            </div>
        `;

        // Display movie recommendations
        content += `
            <div class="ai-results-section">
                <h4>Recommended Movies</h4>
                <div class="ai-results-grid">
        `;

        if (movies.length === 0) {
            content += `<p class="text-muted">No movie recommendations found.</p>`;
        } else {
            movies.forEach(movie => {
                content += this.createMediaCardHTML(movie);
            });
        }

        content += `
                </div>
            </div>
        `;

        // Display TV show recommendations
        content += `
            <div class="ai-results-section">
                <h4>Recommended TV Shows</h4>
                <div class="ai-results-grid">
        `;

        if (shows.length === 0) {
            content += `<p class="text-muted">No TV show recommendations found.</p>`;
        } else {
            shows.forEach(show => {
                content += this.createMediaCardHTML(show);
            });
        }

        content += `
                </div>
            </div>
        `;

        document.getElementById('aiResultsContent').innerHTML = content;

        // Set up action buttons
        this.setupActionButtons();
    }

    createMediaCardHTML(item) {
        return `
            <div class="media-card">
                <div class="position-relative">
                    <img src="${item.poster_url}" alt="${item.title}" class="media-poster">
                    <div class="media-actions">
                        <button class="action-btn like-btn" data-id="${item.id}" data-type="${item.type}">
                            <i class="bi bi-heart"></i>
                        </button>
                        <button class="action-btn watchlist-btn" data-id="${item.id}" data-type="${item.type}">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                    </div>
                </div>
                <div class="media-info">
                    <h3 class="media-title">${item.title}</h3>
                    <div class="media-rating">
                        <span class="rating-star"><i class="bi bi-star-fill"></i></span>
                        <span>${typeof item.rating === 'number' ? item.rating.toFixed(1) : item.rating}</span>
                    </div>
                    <div class="media-year">${item.year}</div>
                </div>
            </div>
        `;
    }

    setupActionButtons() {
        // Set up like and watchlist buttons in the results modal
        const resultsContent = document.getElementById('aiResultsContent');

        resultsContent.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', function() {
                const icon = this.querySelector('i');
                icon.classList.toggle('bi-heart');
                icon.classList.toggle('bi-heart-fill');
                this.classList.toggle('active');
            });
        });

        resultsContent.querySelectorAll('.watchlist-btn').forEach(button => {
            button.addEventListener('click', function() {
                const icon = this.querySelector('i');
                icon.classList.toggle('bi-plus-lg');
                icon.classList.toggle('bi-check-lg');
                this.classList.toggle('active');
            });
        });
    }
}

// Initialize the AI discovery feature when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    new AIDiscovery();
});