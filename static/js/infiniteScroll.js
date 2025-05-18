/**
 * CardGrid class for managing grid of cards with infinite scroll
 */
class CardGrid {
  /**
   * Constructor
   * @param {HTMLElement} container - Grid container element
   */
  constructor(container) {
    this.container = container;
    this.cards = [];
    this.columns = this.calculateColumns();

    // Bind methods to this instance
    this.handleResize = this.handleResize.bind(this);
    
    // Add event listener for window resize
    window.addEventListener('resize', this.handleResize);
  }

  /**
   * Calculate number of columns based on container width
   * @returns {number} - Number of columns
   */
  calculateColumns() {
    if (!this.container) return 2;
    
    const containerWidth = this.container.clientWidth;
    
    // Determine number of columns based on breakpoints
    if (containerWidth < 640) {
      return 2; // Mobile: 2 columns
    } else if (containerWidth < 768) {
      return 3; // Small tablets: 3 columns
    } else if (containerWidth < 1024) {
      return 3; // Tablets: 3 columns
    } else {
      return 4; // Desktop: 4 columns
    }
  }

  /**
   * Add a card to the grid
   * @param {HTMLElement} card - Card element
   */
  addCard(card) {
    this.cards.push(card);
    this.container.appendChild(card);
  }

  /**
   * Handle window resize event
   */
  handleResize() {
    const newColumns = this.calculateColumns();
    
    if (newColumns !== this.columns) {
      this.columns = newColumns;
      // If we wanted to reflow the grid, we could do it here
      // For now we'll let CSS grid handle the responsiveness
    }
  }

  /**
   * Clear all cards from the grid
   */
  clear() {
    this.cards.forEach(card => card.remove());
    this.cards = [];
  }
}
