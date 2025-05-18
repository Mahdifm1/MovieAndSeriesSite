// Main JavaScript file for StreamSense

// Mock data for development - in production this would come from the Django backend API
const MOCK_MOVIES = [
    {
        id: 1,
        title: 'Movie movie-01',
        poster_url: 'https://source.unsplash.com/random/300x450?sunset,silhouette',
        year: 2023,
        rating: 4.8,
        type: 'movie',
        genres: ['Action', 'Adventure']
    },
    {
        id: 2,
        title: 'Movie movie-02',
        poster_url: 'https://source.unsplash.com/random/300x450?mountains,green',
        year: 2021,
        rating: 4.3,
        type: 'movie',
        genres: ['Drama', 'Mystery']
    },
    {
        id: 3,
        title: 'Movie movie-03',
        poster_url: 'https://source.unsplash.com/random/300x450?trees,fog',
        year: 2023,
        rating: 4.5,
        type: 'movie',
        genres: ['Sci-Fi', 'Adventure']
    },
    {
        id: 4,
        title: 'Movie movie-04',
        poster_url: 'https://source.unsplash.com/random/300x450?coast,pier',
        year: 2023,
        rating: 4.7,
        type: 'movie',
        genres: ['Romance', 'Drama']
    },
    {
        id: 5,
        title: 'Movie movie-05',
        poster_url: 'https://source.unsplash.com/random/300x450?coffee,desk',
        year: 2022,
        rating: 4.2,
        type: 'movie',
        genres: ['Comedy', 'Romance']
    },
    {
        id: 6,
        title: 'Movie movie-06',
        poster_url: 'https://source.unsplash.com/random/300x450?city,night',
        year: 2022,
        rating: 4.4,
        type: 'movie',
        genres: ['Thriller', 'Crime']
    },
    {
        id: 7,
        title: 'Movie movie-07',
        poster_url: 'https://source.unsplash.com/random/300x450?forest,path',
        year: 2021,
        rating: 4.1,
        type: 'movie',
        genres: ['Horror', 'Mystery']
    },
    {
        id: 8,
        title: 'Movie movie-08',
        poster_url: 'https://source.unsplash.com/random/300x450?beach,waves',
        year: 2022,
        rating: 4.6,
        type: 'movie',
        genres: ['Action', 'Thriller']
    },
    {
        id: 9,
        title: 'Movie movie-09',
        poster_url: 'https://source.unsplash.com/random/300x450?mountain,snow',
        year: 2021,
        rating: 4.3,
        type: 'movie',
        genres: ['Adventure', 'Fantasy']
    },
    {
        id: 10,
        title: 'Movie movie-10',
        poster_url: 'https://source.unsplash.com/random/300x450?desert,sand',
        year: 2023,
        rating: 4.5,
        type: 'movie',
        genres: ['Action', 'Sci-Fi']
    },
    {
        id: 11,
        title: 'Movie movie-11',
        poster_url: 'https://source.unsplash.com/random/300x450?waterfall',
        year: 2022,
        rating: 4.2,
        type: 'movie',
        genres: ['Drama', 'Romance']
    },
    {
        id: 12,
        title: 'Movie movie-12',
        poster_url: 'https://source.unsplash.com/random/300x450?cityscape',
        year: 2021,
        rating: 4.7,
        type: 'movie',
        genres: ['Crime', 'Drama']
    },
    {
        id: 13,
        title: 'Movie movie-13',
        poster_url: 'https://source.unsplash.com/random/300x450?stars,night',
        year: 2023,
        rating: 4.8,
        type: 'movie',
        genres: ['Sci-Fi', 'Fantasy']
    },
    {
        id: 14,
        title: 'Movie movie-14',
        poster_url: 'https://source.unsplash.com/random/300x450?lake,reflection',
        year: 2022,
        rating: 4.4,
        type: 'movie',
        genres: ['Mystery', 'Thriller']
    },
    {
        id: 15,
        title: 'Movie movie-15',
        poster_url: 'https://source.unsplash.com/random/300x450?autumn,trees',
        year: 2023,
        rating: 4.6,
        type: 'movie',
        genres: ['Adventure', 'Fantasy']
    }
];

const MOCK_SHOWS = [
    {
        id: 101,
        title: 'TV Show tv-01',
        poster_url: 'https://source.unsplash.com/random/300x450?bicycle,sunset',
        year: 2022,
        rating: 4.9,
        type: 'tvshow',
        genres: ['Drama', 'Crime']
    },
    {
        id: 102,
        title: 'TV Show tv-02',
        poster_url: 'https://source.unsplash.com/random/300x450?clouds,sky',
        year: 2021,
        rating: 4.6,
        type: 'tvshow',
        genres: ['Fantasy', 'Adventure']
    },
    {
        id: 103,
        title: 'TV Show tv-03',
        poster_url: 'https://source.unsplash.com/random/300x450?sunset,horizon',
        year: 2022,
        rating: 4.8,
        type: 'tvshow',
        genres: ['Sci-Fi', 'Mystery']
    },
    {
        id: 104,
        title: 'TV Show tv-04',
        poster_url: 'https://source.unsplash.com/random/300x450?city,architecture',
        year: 2023,
        rating: 4.7,
        type: 'tvshow',
        genres: ['Thriller', 'Crime']
    },
    {
        id: 105,
        title: 'TV Show tv-05',
        poster_url: 'https://source.unsplash.com/random/300x450?dog,pet',
        year: 2022,
        rating: 4.5,
        type: 'tvshow',
        genres: ['Comedy', 'Family']
    },
    {
        id: 106,
        title: 'TV Show tv-06',
        poster_url: 'https://source.unsplash.com/random/300x450?mountain,valley',
        year: 2021,
        rating: 4.4,
        type: 'tvshow',
        genres: ['Adventure', 'Documentary']
    },
    {
        id: 107,
        title: 'TV Show tv-07',
        poster_url: 'https://source.unsplash.com/random/300x450?street,urban',
        year: 2022,
        rating: 4.5,
        type: 'tvshow',
        genres: ['Drama', 'Crime']
    },
    {
        id: 108,
        title: 'TV Show tv-08',
        poster_url: 'https://source.unsplash.com/random/300x450?ocean,waves',
        year: 2023,
        rating: 4.6,
        type: 'tvshow',
        genres: ['Documentary', 'Nature']
    },
    {
        id: 109,
        title: 'TV Show tv-09',
        poster_url: 'https://source.unsplash.com/random/300x450?garden,flowers',
        year: 2022,
        rating: 4.3,
        type: 'tvshow',
        genres: ['Comedy', 'Romance']
    },
    {
        id: 110,
        title: 'TV Show tv-10',
        poster_url: 'https://source.unsplash.com/random/300x450?night,cityscape',
        year: 2023,
        rating: 4.8,
        type: 'tvshow',
        genres: ['Action', 'Thriller']
    },
    {
        id: 111,
        title: 'TV Show tv-11',
        poster_url: 'https://source.unsplash.com/random/300x450?wildlife,nature',
        year: 2021,
        rating: 4.5,
        type: 'tvshow',
        genres: ['Documentary', 'Drama']
    },
    {
        id: 112,
        title: 'TV Show tv-12',
        poster_url: 'https://source.unsplash.com/random/300x450?road,travel',
        year: 2022,
        rating: 4.4,
        type: 'tvshow',
        genres: ['Adventure', 'Reality']
    },
    {
        id: 113,
        title: 'TV Show tv-13',
        poster_url: 'https://source.unsplash.com/random/300x450?food,cuisine',
        year: 2023,
        rating: 4.7,
        type: 'tvshow',
        genres: ['Reality', 'Competition']
    },
    {
        id: 114,
        title: 'TV Show tv-14',
        poster_url: 'https://source.unsplash.com/random/300x450?architecture,building',
        year: 2021,
        rating: 4.3,
        type: 'tvshow',
        genres: ['Documentary', 'History']
    },
    {
        id: 115,
        title: 'TV Show tv-15',
        poster_url: 'https://source.unsplash.com/random/300x450?animal,wildlife',
        year: 2022,
        rating: 4.6,
        type: 'tvshow',
        genres: ['Documentary', 'Family']
    }
];

const MOCK_LATEST = [
    ...MOCK_MOVIES.slice(0, 8).map(movie => ({...movie, isNew: true})),
    ...MOCK_SHOWS.slice(0, 7).map(show => ({...show, isNew: true}))
];

const MOCK_TRENDING = [
    ...MOCK_MOVIES.slice(5, 10).map(movie => ({...movie, trending: true})),
    ...MOCK_SHOWS.slice(5, 10).map(show => ({...show, trending: true}))
];

// API Service (in production, this would make real API calls to the Django backend)
const ApiService = {
    // Fetch recommended movies
    getRecommendedMovies: function() {
        // Simulate API call with promise
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_MOVIES);
            }, 300);
        });
    },
    
    // Fetch recommended TV shows
    getRecommendedShows: function() {
        // Simulate API call with promise
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_SHOWS);
            }, 300);
        });
    },
    
    // Fetch latest releases
    getLatestReleases: function() {
        // Simulate API call with promise
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_LATEST);
            }, 300);
        });
    },
    
    // Fetch trending content
    getTrending: function() {
        // Simulate API call with promise
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_TRENDING);
            }, 300);
        });
    },
    
    // Fetch browse content with filters
    getBrowseContent: function(filters = {}, page = 1) {
        // Simulate API call with promise
        return new Promise((resolve) => {
            // In a real app, these filters would be sent to the backend
            // Here we'll just do some client-side filtering on our mock data
            let results = [...MOCK_MOVIES, ...MOCK_SHOWS];
            
            // Apply type filter
            if (filters.type && filters.type !== 'all') {
                results = results.filter(item => item.type === filters.type);
            }
            
            // Apply year filter
            if (filters.year && filters.year !== 'all') {
                if (filters.year === 'older') {
                    results = results.filter(item => item.year < 2020);
                } else {
                    results = results.filter(item => item.year === parseInt(filters.year));
                }
            }
            
            // Apply rating filter
            if (filters.rating && filters.rating !== 'all') {
                results = results.filter(item => item.rating >= parseInt(filters.rating));
            }
            
            // Apply genre filter
            if (filters.genre && filters.genre !== 'all') {
                const genre = filters.genre.charAt(0).toUpperCase() + filters.genre.slice(1);
                results = results.filter(item => item.genres.includes(genre));
            }
            
            // Apply actor filter (this would be more complex in a real app)
            if (filters.actor && filters.actor.trim() !== '') {
                // Just a simple simulation - in a real app, this would properly filter by actors
                results = results.filter(() => Math.random() > 0.5);
            }
            
            // Determine the total number of items and pages
            const totalItems = results.length;
            const pageSize = 30;
            const totalPages = Math.ceil(totalItems / pageSize);
            
            // Get the items for the requested page
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedResults = results.slice(startIndex, endIndex);
            
            // Return the paginated results along with pagination info
            setTimeout(() => {
                resolve({
                    results: paginatedResults,
                    pagination: {
                        currentPage: page,
                        totalPages: totalPages,
                        pageSize: pageSize,
                        totalItems: totalItems
                    }
                });
            }, 500);
        });
    },
    
    // Send AI discovery prompt (would connect to AI service in production)
    sendAiDiscoveryPrompt: function(prompt) {
        // Simulate API call with promise
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate AI recommendations by randomly selecting movies and shows
                const aiRecommendations = {
                    prompt: prompt,
                    movies: MOCK_MOVIES.sort(() => 0.5 - Math.random()).slice(0, 5),
                    shows: MOCK_SHOWS.sort(() => 0.5 - Math.random()).slice(0, 5)
                };
                resolve(aiRecommendations);
            }, 1500);
        });
    }
};

// Helper function to create media card HTML
function createMediaCardHtml(item) {
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
                ${item.isNew ? '<span class="badge bg-primary position-absolute" style="top: 10px; left: 10px;">NEW</span>' : ''}
            </div>
            <div class="media-info">
                <h3 class="media-title">${item.title}</h3>
                <div class="media-rating">
                    <span class="rating-star"><i class="bi bi-star-fill"></i></span>
                    <span>${item.rating.toFixed(1)}</span>
                </div>
                <div class="media-year">${item.year}</div>
            </div>
        </div>
    `;
}

// Initialize page-specific functionality when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up like and watchlist buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.like-btn')) {
            const button = e.target.closest('.like-btn');
            const icon = button.querySelector('i');
            icon.classList.toggle('bi-heart');
            icon.classList.toggle('bi-heart-fill');
            button.classList.toggle('active');
            
            // In a real app, this would send an API request to update the user's likes
            console.log('Toggled like for:', button.dataset.type, button.dataset.id);
        }
        
        if (e.target.closest('.watchlist-btn')) {
            const button = e.target.closest('.watchlist-btn');
            const icon = button.querySelector('i');
            icon.classList.toggle('bi-plus-lg');
            icon.classList.toggle('bi-check-lg');
            button.classList.toggle('active');
            
            // In a real app, this would send an API request to update the user's watchlist
            console.log('Toggled watchlist for:', button.dataset.type, button.dataset.id);
        }
    });
    
    // Handle AI Discovery form submission
    const aiDiscoveryForm = document.getElementById('aiDiscoveryForm');
    if (aiDiscoveryForm) {
        aiDiscoveryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const promptInput = document.getElementById('aiPrompt');
            const prompt = promptInput.value.trim();
            
            if (!prompt) return;
            
            // Show loading state
            const submitButton = aiDiscoveryForm.querySelector('button[type="submit"]');
            const buttonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
            submitButton.disabled = true;
            
            // Send AI discovery request
            ApiService.sendAiDiscoveryPrompt(prompt)
                .then(response => {
                    console.log('AI recommendations:', response);
                    // In a real app, you would display the recommendations to the user
                    // For now, just close the modal and show an alert
                    const modal = bootstrap.Modal.getInstance(document.getElementById('aiDiscoveryModal'));
                    modal.hide();
                    alert(`Found ${response.movies.length} movies and ${response.shows.length} shows based on your prompt!`);
                })
                .catch(error => {
                    console.error('AI discovery error:', error);
                    alert('An error occurred while processing your request. Please try again later.');
                })
                .finally(() => {
                    // Reset form and button
                    submitButton.innerHTML = buttonText;
                    submitButton.disabled = false;
                    promptInput.value = '';
                });
        });
    }
});