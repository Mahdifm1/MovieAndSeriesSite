/**
 * API Client for making requests to the backend
 */
class ApiClient {
  /**
   * Constructor
   */
  constructor() {
    this.baseUrl = '/api';
  }

  /**
   * Helper method to make API requests
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise} - Fetch promise
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Default options
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    };
    
    // Merge options
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }

  /**
   * Get recommendations for the current user
   * @param {number} page - Page number
   * @param {number} perPage - Items per page
   * @returns {Promise} - Recommendations promise
   */
  async getRecommendations(page = 1, perPage = 10) {
    return this.request(`/recommendations/?page=${page}&per_page=${perPage}`);
  }

  /**
   * Get latest releases
   * @param {number} page - Page number
   * @param {number} perPage - Items per page
   * @param {string} type - Media type (movie, tvshow, or all)
   * @returns {Promise} - Latest releases promise
   */
  async getLatest(page = 1, perPage = 10, type = 'all') {
    return this.request(`/latest/?page=${page}&per_page=${perPage}&type=${type}`);
  }

  /**
   * Get trending media
   * @param {number} page - Page number
   * @param {number} perPage - Items per page
   * @returns {Promise} - Trending promise
   */
  async getTrending(page = 1, perPage = 20) {
    return this.request(`/trending/?page=${page}&per_page=${perPage}`);
  }

  /**
   * Toggle like status for a movie or TV show
   * @param {string} type - Media type (movie or tvshow)
   * @param {number} id - Media ID
   * @returns {Promise} - Like status promise
   */
  async toggleLike(type, id) {
    return this.request('/like', {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    });
  }

  /**
   * Toggle watchlist status for a movie or TV show
   * @param {string} type - Media type (movie or tvshow)
   * @param {number} id - Media ID
   * @returns {Promise} - Watchlist status promise
   */
  async toggleWatchlist(type, id) {
    return this.request('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    });
  }

  /**
   * Check if user is authenticated
   * @returns {Promise} - Auth status promise
   */
  async checkAuth() {
    return this.request('/auth/check');
  }

  /**
   * Search for media using AI
   * @param {string} prompt - Search prompt
   * @returns {Promise} - AI search results promise
   */
  async aiSearch(prompt) {
    return this.request('/ai-search', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }
}

// Create and attach the API client to window object
window.api = new ApiClient();
