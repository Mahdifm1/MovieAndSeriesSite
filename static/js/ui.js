/**
 * UI Manager for handling DOM interactions
 */
class UIManager {
  /**
   * Constructor
   */
  constructor() {
    this.api = window.api;
    this.cardGrid = null;
    this.isAuthenticated = false;
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMoreItems = true;
    
    // Bind event methods to this instance
    this.handleLikeClick = this.handleLikeClick.bind(this);
    this.handleWatchlistClick = this.handleWatchlistClick.bind(this);
    this.handleAISearchSubmit = this.handleAISearchSubmit.bind(this);
    this.handleTrendingScroll = this.handleTrendingScroll.bind(this);
    this.handleMobileMenuToggle = this.handleMobileMenuToggle.bind(this);
  }

  /**
   * Initialize the UI
   */
  async init() {
    // Check authentication status
    try {
      const authData = await this.api.checkAuth();
      this.isAuthenticated = authData.authenticated;
      
      // Update UI based on auth status
      this.updateAuthUI(authData);
      
      // Initialize card grid for infinite scroll
      this.cardGrid = new CardGrid(document.querySelector('.trending-grid'));
      
      // Load initial data
      if (this.isAuthenticated) {
        this.loadRecommendations();
      }
      
      this.loadLatest();
      this.loadTrending();
      
      // Set up event listeners
      this.setupEventListeners();
      
    } catch (error) {
      console.error('Error initializing UI:', error);
      this.showError('Failed to initialize the application. Please refresh the page.');
    }
  }

  /**
   * Update UI based on authentication status
   * @param {Object} authData - Authentication data
   */
  updateAuthUI(authData) {
    const authNav = document.getElementById('auth-nav');
    const personalizedContent = document.getElementById('personalized-content');
    const genericContent = document.getElementById('generic-content');
    
    if (authData.authenticated) {
      // User is logged in
      if (authNav) {
        authNav.innerHTML = `
          <a href="/profile" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            ${authData.user.username}
          </a>
          <a href="/auth/logout" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Logout
          </a>
        `;
      }
      
      // Show personalized content
      if (personalizedContent) {
        personalizedContent.classList.remove('hidden');
      }
      if (genericContent) {
        genericContent.classList.add('hidden');
      }
    } else {
      // User is not logged in
      if (authNav) {
        authNav.innerHTML = `
          <a href="/auth/login" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Login
          </a>
          <a href="/auth/register" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Register
          </a>
        `;
      }
      
      // Show generic content
      if (personalizedContent) {
        personalizedContent.classList.add('hidden');
      }
      if (genericContent) {
        genericContent.classList.remove('hidden');
      }
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
      mobileMenuButton.addEventListener('click', this.handleMobileMenuToggle);
    }
    
    // Like buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.like-button')) {
        const button = e.target.closest('.like-button');
        const type = button.dataset.type;
        const id = button.dataset.id;
        this.handleLikeClick(type, id, button);
      }
    });
    
    // Watchlist buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.watchlist-button')) {
        const button = e.target.closest('.watchlist-button');
        const type = button.dataset.type;
        const id = button.dataset.id;
        this.handleWatchlistClick(type, id, button);
      }
    });
    
    // AI search form
    const aiSearchForm = document.getElementById('ai-search-form');
    if (aiSearchForm) {
      aiSearchForm.addEventListener('submit', this.handleAISearchSubmit);
    }
    
    // Initialize infinite scroll
    this.setupInfiniteScroll();
  }

  /**
   * Set up infinite scroll for trending grid
   */
  setupInfiniteScroll() {
    // Create an intersection observer
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoading && this.hasMoreItems) {
          this.handleTrendingScroll();
        }
      });
    }, options);
    
    // Observe the loading element
    const loadingElement = document.getElementById('loading-more');
    if (loadingElement) {
      observer.observe(loadingElement);
    }
  }

  /**
   * Load recommendations for the current user
   */
  async loadRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations-container');
    if (!recommendationsContainer) return;
    
    try {
      recommendationsContainer.innerHTML = '<div class="flex justify-center p-4"><div class="loader"></div></div>';
      
      const data = await this.api.getRecommendations();
      
      if (data.items.length === 0) {
        recommendationsContainer.innerHTML = '<p class="text-center text-gray-500 p-4">No recommendations available yet. Try liking some movies or TV shows!</p>';
        return;
      }
      
      // Render recommendations
      recommendationsContainer.innerHTML = '';
      data.items.slice(0, 5).forEach(item => {
        const card = this.createCard(item);
        recommendationsContainer.appendChild(card);
      });
      
    } catch (error) {
      console.error('Error loading recommendations:', error);
      recommendationsContainer.innerHTML = '<p class="text-center text-red-500 p-4">Failed to load recommendations. Please try again later.</p>';
    }
  }

  /**
   * Load latest releases
   */
  async loadLatest() {
    const latestContainer = document.getElementById('latest-container');
    if (!latestContainer) return;
    
    try {
      latestContainer.innerHTML = '<div class="flex justify-center p-4"><div class="loader"></div></div>';
      
      const data = await this.api.getLatest();
      
      if (data.items.length === 0) {
        latestContainer.innerHTML = '<p class="text-center text-gray-500 p-4">No latest releases available.</p>';
        return;
      }
      
      // Render latest releases
      latestContainer.innerHTML = '';
      data.items.slice(0, 5).forEach(item => {
        const card = this.createCard(item);
        latestContainer.appendChild(card);
      });
      
    } catch (error) {
      console.error('Error loading latest releases:', error);
      latestContainer.innerHTML = '<p class="text-center text-red-500 p-4">Failed to load latest releases. Please try again later.</p>';
    }
  }

  /**
   * Load trending items
   */
  async loadTrending() {
    const trendingGrid = document.querySelector('.trending-grid');
    if (!trendingGrid) return;
    
    try {
      this.isLoading = true;
      document.getElementById('loading-more').classList.remove('hidden');
      
      const data = await this.api.getTrending(this.currentPage);
      
      this.hasMoreItems = data.items.length > 0 && this.currentPage * data.per_page < data.total;
      
      // Render trending items
      data.items.forEach(item => {
        const card = this.createCard(item);
        this.cardGrid.addCard(card);
      });
      
      this.currentPage++;
      this.isLoading = false;
      
      if (!this.hasMoreItems) {
        document.getElementById('loading-more').classList.add('hidden');
        document.getElementById('no-more-items').classList.remove('hidden');
      }
      
    } catch (error) {
      console.error('Error loading trending items:', error);
      document.getElementById('loading-error').classList.remove('hidden');
      this.isLoading = false;
    } finally {
      document.getElementById('loading-more').classList.add('hidden');
    }
  }

  /**
   * Handle trending scroll event
   */
  handleTrendingScroll() {
    if (!this.isLoading && this.hasMoreItems) {
      this.loadTrending();
    }
  }

  /**
   * Create a card element for a movie or TV show
   * @param {Object} item - Movie or TV show data
   * @returns {HTMLElement} - Card element
   */
  createCard(item) {
    const card = document.createElement('div');
    card.className = 'bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105';
    
    // Default placeholder for missing poster
    const posterUrl = item.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster';
    
    // Check if user is authenticated to show interaction buttons
    const interactionButtons = this.isAuthenticated ? `
      <div class="flex justify-between px-3 py-2">
        <button class="like-button flex items-center text-gray-400 hover:text-red-500 focus:outline-none" 
                data-type="${item.type}" data-id="${item.id}" aria-label="Like">
          <svg class="${item.liked ? 'text-red-500' : ''}" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
          </svg>
        </button>
        <button class="watchlist-button flex items-center text-gray-400 hover:text-yellow-500 focus:outline-none" 
                data-type="${item.type}" data-id="${item.id}" aria-label="Add to watchlist">
          <svg class="${item.in_watchlist ? 'text-yellow-500' : ''}" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"></path>
          </svg>
        </button>
      </div>
    ` : '';
    
    card.innerHTML = `
      <div class="relative pb-2/3">
        <img src="${posterUrl}" alt="${item.title}" class="absolute h-full w-full object-cover" loading="lazy">
      </div>
      <div class="p-4">
        <h3 class="text-white font-bold truncate">${item.title}</h3>
        <div class="flex items-center mt-1">
          <span class="text-yellow-400">${item.imdb_score ? item.imdb_score.toFixed(1) : 'N/A'}</span>
          <span class="ml-2 text-gray-400 text-sm">${item.type === 'movie' ? 'Movie' : 'TV Show'}</span>
        </div>
        <p class="text-gray-400 text-sm mt-2 line-clamp-2">${item.summary || 'No summary available.'}</p>
      </div>
      ${interactionButtons}
    `;
    
    return card;
  }

  /**
   * Handle like button click
   * @param {string} type - Media type (movie or tvshow)
   * @param {number} id - Media ID
   * @param {HTMLElement} button - Like button element
   */
  async handleLikeClick(type, id, button) {
    if (!this.isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    
    try {
      const iconElement = button.querySelector('svg');
      const currentState = iconElement.classList.contains('text-red-500');
      
      // Optimistic UI update
      if (currentState) {
        iconElement.classList.remove('text-red-500');
      } else {
        iconElement.classList.add('text-red-500');
      }
      
      // Send request to server
      const response = await this.api.toggleLike(type, id);
      
      // Revert if server response doesn't match expected state
      if ((response.status === 'liked' && currentState) || 
          (response.status === 'unliked' && !currentState)) {
        if (currentState) {
          iconElement.classList.add('text-red-500');
        } else {
          iconElement.classList.remove('text-red-500');
        }
      }
      
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert UI on error
      const iconElement = button.querySelector('svg');
      if (iconElement.classList.contains('text-red-500')) {
        iconElement.classList.remove('text-red-500');
      } else {
        iconElement.classList.add('text-red-500');
      }
      this.showError('Failed to update like status. Please try again.');
    }
  }

  /**
   * Handle watchlist button click
   * @param {string} type - Media type (movie or tvshow)
   * @param {number} id - Media ID
   * @param {HTMLElement} button - Watchlist button element
   */
  async handleWatchlistClick(type, id, button) {
    if (!this.isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    
    try {
      const iconElement = button.querySelector('svg');
      const currentState = iconElement.classList.contains('text-yellow-500');
      
      // Optimistic UI update
      if (currentState) {
        iconElement.classList.remove('text-yellow-500');
      } else {
        iconElement.classList.add('text-yellow-500');
      }
      
      // Send request to server
      const response = await this.api.toggleWatchlist(type, id);
      
      // Revert if server response doesn't match expected state
      if ((response.status === 'added' && currentState) || 
          (response.status === 'removed' && !currentState)) {
        if (currentState) {
          iconElement.classList.add('text-yellow-500');
        } else {
          iconElement.classList.remove('text-yellow-500');
        }
      }
      
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      // Revert UI on error
      const iconElement = button.querySelector('svg');
      if (iconElement.classList.contains('text-yellow-500')) {
        iconElement.classList.remove('text-yellow-500');
      } else {
        iconElement.classList.add('text-yellow-500');
      }
      this.showError('Failed to update watchlist status. Please try again.');
    }
  }

  /**
   * Handle AI search form submit
   * @param {Event} event - Form submit event
   */
  async handleAISearchSubmit(event) {
    event.preventDefault();
    
    if (!this.isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    
    const form = event.target;
    const promptInput = form.querySelector('input[name="prompt"]');
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
      this.showError('Please enter a search prompt.');
      return;
    }
    
    const resultsContainer = document.getElementById('ai-search-results');
    const searchSpinner = document.getElementById('ai-search-spinner');
    
    try {
      // Show loading spinner
      searchSpinner.classList.remove('hidden');
      resultsContainer.innerHTML = '';
      
      // Send AI search request
      const response = await this.api.aiSearch(prompt);
      
      // Display results
      resultsContainer.innerHTML = `
        <h3 class="text-xl font-bold mb-4">AI Search Results</h3>
        <p class="mb-4">Based on your prompt: "${prompt}"</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${response.results.map(result => `
            <div class="bg-gray-800 p-4 rounded-lg">
              <h4 class="font-bold">${result.title}</h4>
              <span class="text-sm text-gray-400">${result.type === 'movie' ? 'Movie' : 'TV Show'}</span>
              <p class="mt-2 text-sm">${result.short_description || 'No description available.'}</p>
              <div class="mt-2 text-sm text-gray-400">Match score: ${(result.similarity_score * 100).toFixed(0)}%</div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Show the results container
      resultsContainer.classList.remove('hidden');
      
      // Scroll to results
      resultsContainer.scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error performing AI search:', error);
      resultsContainer.innerHTML = '<p class="text-red-500">Failed to perform AI search. Please try again later.</p>';
      resultsContainer.classList.remove('hidden');
    } finally {
      searchSpinner.classList.add('hidden');
    }
  }

  /**
   * Handle mobile menu toggle
   */
  handleMobileMenuToggle() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorAlert = document.createElement('div');
    errorAlert.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg';
    errorAlert.textContent = message;
    
    document.body.appendChild(errorAlert);
    
    // Remove after 5 seconds
    setTimeout(() => {
      errorAlert.remove();
    }, 5000);
  }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.uiManager = new UIManager();
  window.uiManager.init();
});
