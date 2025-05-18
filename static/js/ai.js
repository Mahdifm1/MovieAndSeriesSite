/**
 * AI-related functionality for the streaming platform
 */
class AIService {
  /**
   * Constructor
   */
  constructor() {
    this.api = window.api;
  }

  /**
   * Initialize AI functionality
   */
  init() {
    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // AI search modal open button
    const aiSearchButton = document.getElementById('ai-search-button');
    if (aiSearchButton) {
      aiSearchButton.addEventListener('click', this.openAISearchModal.bind(this));
    }
    
    // AI search modal close button
    const closeModalButton = document.getElementById('close-modal-button');
    if (closeModalButton) {
      closeModalButton.addEventListener('click', this.closeAISearchModal.bind(this));
    }
    
    // AI search form submission
    const aiSearchForm = document.getElementById('ai-search-form');
    if (aiSearchForm) {
      aiSearchForm.addEventListener('submit', this.handleAISearchSubmit.bind(this));
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      const modal = document.getElementById('ai-search-modal');
      if (modal && e.target === modal) {
        this.closeAISearchModal();
      }
    });
    
    // Close modal with Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAISearchModal();
      }
    });
  }

  /**
   * Open AI search modal
   */
  openAISearchModal() {
    const modal = document.getElementById('ai-search-modal');
    if (modal) {
      modal.classList.remove('hidden');
      
      // Focus on input field
      const input = document.getElementById('ai-search-input');
      if (input) {
        setTimeout(() => {
          input.focus();
        }, 100);
      }
    }
  }

  /**
   * Close AI search modal
   */
  closeAISearchModal() {
    const modal = document.getElementById('ai-search-modal');
    if (modal) {
      modal.classList.add('hidden');
      
      // Clear previous results
      const resultsContainer = document.getElementById('ai-results-container');
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
      }
      
      // Clear input
      const input = document.getElementById('ai-search-input');
      if (input) {
        input.value = '';
      }
    }
  }

  /**
   * Handle AI search form submission
   * @param {Event} e - Form submit event
   */
  async handleAISearchSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const input = form.querySelector('#ai-search-input');
    const prompt = input.value.trim();
    
    if (!prompt) {
      this.showError('Please enter a search prompt.');
      return;
    }
    
    const resultsContainer = document.getElementById('ai-results-container');
    const loadingSpinner = document.getElementById('ai-loading-spinner');
    
    try {
      // Show loading spinner
      loadingSpinner.classList.remove('hidden');
      resultsContainer.innerHTML = '';
      
      // Perform AI search
      const response = await this.api.aiSearch(prompt);
      
      // Display results
      this.displayAIResults(response, resultsContainer);
      
    } catch (error) {
      console.error('AI search error:', error);
      resultsContainer.innerHTML = `
        <div class="bg-red-500 text-white p-4 rounded-lg">
          <p>Sorry, we encountered an error processing your request. Please try again later.</p>
        </div>
      `;
    } finally {
      loadingSpinner.classList.add('hidden');
    }
  }

  /**
   * Display AI search results
   * @param {Object} response - API response
   * @param {HTMLElement} container - Results container element
   */
  displayAIResults(response, container) {
    if (!response.results || response.results.length === 0) {
      container.innerHTML = `
        <div class="bg-gray-800 p-4 rounded-lg">
          <p class="text-center">No results found for your search. Try a different prompt!</p>
        </div>
      `;
      return;
    }
    
    // Group results by type
    const movies = response.results.filter(item => item.type === 'movie');
    const tvshows = response.results.filter(item => item.type === 'tvshow');
    
    container.innerHTML = `
      <div class="mb-6">
        <h3 class="text-xl font-bold mb-4">Based on your prompt: "${response.prompt}"</h3>
        
        ${movies.length > 0 ? `
          <div class="mb-6">
            <h4 class="text-lg font-semibold mb-2">Recommended Movies</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${movies.map(movie => `
                <div class="bg-gray-800 p-4 rounded-lg">
                  <h5 class="font-bold text-white">${movie.title}</h5>
                  <div class="text-yellow-400 text-sm mb-2">Match: ${(movie.similarity_score * 100).toFixed(0)}%</div>
                  <p class="text-gray-300 text-sm">${movie.short_description || 'No description available.'}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${tvshows.length > 0 ? `
          <div>
            <h4 class="text-lg font-semibold mb-2">Recommended TV Shows</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${tvshows.map(tvshow => `
                <div class="bg-gray-800 p-4 rounded-lg">
                  <h5 class="font-bold text-white">${tvshow.title}</h5>
                  <div class="text-yellow-400 text-sm mb-2">Match: ${(tvshow.similarity_score * 100).toFixed(0)}%</div>
                  <p class="text-gray-300 text-sm">${tvshow.short_description || 'No description available.'}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorContainer = document.getElementById('ai-error-message');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.classList.remove('hidden');
      
      setTimeout(() => {
        errorContainer.classList.add('hidden');
      }, 5000);
    }
  }
}

// Initialize AI service when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.aiService = new AIService();
  window.aiService.init();
});
