// Carousel functionality for StreamSense

// Carousel class to handle the horizontal scrolling functionality
class Carousel {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;
        
        this.inner = this.container.querySelector('.carousel-inner');
        this.prevBtn = document.querySelector(`#${containerSelector.substring(1)}Prev`);
        this.nextBtn = document.querySelector(`#${containerSelector.substring(1)}Next`);
        
        // Set default options and merge with provided options
        this.options = {
            itemsToShow: options.itemsToShow || 5,
            itemsToScroll: options.itemsToScroll || 1,
            gap: options.gap || 16,
            infinite: options.infinite || false,
            autoplay: options.autoplay || false,
            autoplayInterval: options.autoplayInterval || 5000
        };
        
        this.items = [];
        this.itemWidth = 0;
        this.currentIndex = 0;
        this.totalItems = 0;
        this.autoplayTimer = null;
        
        // Initialize carousel
        this.init();
    }
    
    init() {
        if (!this.inner) return;
        
        // Set up event listeners
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
        
        // Handle viewport resizing
        window.addEventListener('resize', () => this.updateDimensions());
        
        // Start autoplay if enabled
        if (this.options.autoplay) {
            this.startAutoplay();
        }
    }
    
    // Load items into the carousel
    loadItems(items) {
        if (!this.inner) return;
        
        this.items = items;
        this.totalItems = items.length;
        
        // Clear existing content
        this.inner.innerHTML = '';
        
        // Create and append items
        items.forEach(item => {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            carouselItem.innerHTML = createMediaCardHtml(item);
            this.inner.appendChild(carouselItem);
        });
        
        // Update dimensions and UI
        this.updateDimensions();
        this.updateButtons();
        
        // Update the counter text
        this.updateCounter();
    }
    
    // Calculate and update dimensions based on viewport
    updateDimensions() {
        if (!this.inner || this.items.length === 0) return;
        
        const containerWidth = this.container.querySelector('.carousel-container').offsetWidth;
        
        // Calculate number of items to show based on viewport width
        let itemsToShow = this.options.itemsToShow;
        if (window.innerWidth < 576) {
            itemsToShow = 1;
        } else if (window.innerWidth < 768) {
            itemsToShow = 2;
        } else if (window.innerWidth < 992) {
            itemsToShow = 3;
        } else if (window.innerWidth < 1200) {
            itemsToShow = 4;
        }
        
        // Calculate item width
        this.itemWidth = (containerWidth - (itemsToShow - 1) * this.options.gap) / itemsToShow;
        
        // Update carousel items width and gap
        const carouselItems = this.inner.querySelectorAll('.carousel-item');
        carouselItems.forEach(item => {
            item.style.width = `${this.itemWidth}px`;
            item.style.marginRight = `${this.options.gap}px`;
        });
        
        // Update carousel position
        this.goTo(this.currentIndex);
    }
    
    // Move to the next slide
    next() {
        const maxIndex = Math.max(0, this.totalItems - this.getVisibleItems());
        const nextIndex = Math.min(maxIndex, this.currentIndex + this.options.itemsToScroll);
        this.goTo(nextIndex);
    }
    
    // Move to the previous slide
    prev() {
        const prevIndex = Math.max(0, this.currentIndex - this.options.itemsToScroll);
        this.goTo(prevIndex);
    }
    
    // Go to a specific slide
    goTo(index) {
        if (!this.inner) return;
        
        this.currentIndex = index;
        
        // Calculate the translation amount
        const translateX = -index * (this.itemWidth + this.options.gap);
        this.inner.style.transform = `translateX(${translateX}px)`;
        
        // Update button states
        this.updateButtons();
        
        // Update counter
        this.updateCounter();
    }
    
    // Get number of visible items based on current viewport
    getVisibleItems() {
        if (window.innerWidth < 576) {
            return 1;
        } else if (window.innerWidth < 768) {
            return 2;
        } else if (window.innerWidth < 992) {
            return 3;
        } else if (window.innerWidth < 1200) {
            return 4;
        }
        return this.options.itemsToShow;
    }
    
    // Update prev/next button states
    updateButtons() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentIndex === 0;
            this.prevBtn.classList.toggle('disabled', this.currentIndex === 0);
        }
        
        if (this.nextBtn) {
            const maxIndex = Math.max(0, this.totalItems - this.getVisibleItems());
            this.nextBtn.disabled = this.currentIndex >= maxIndex;
            this.nextBtn.classList.toggle('disabled', this.currentIndex >= maxIndex);
        }
    }
    
    // Update the counter display
    updateCounter() {
        const visibleItems = this.getVisibleItems();
        const start = this.currentIndex + 1;
        const end = Math.min(this.currentIndex + visibleItems, this.totalItems);
        
        // Find the counter element based on carousel ID
        const carouselId = this.container.id;
        let counterClass;
        
        if (carouselId === 'moviesCarousel') {
            counterClass = 'movies-counter';
        } else if (carouselId === 'showsCarousel') {
            counterClass = 'shows-counter';
        } else if (carouselId === 'latestCarousel') {
            counterClass = 'latest-counter';
        }
        
        if (counterClass) {
            const counterElement = document.querySelector(`.${counterClass}`);
            if (counterElement) {
                counterElement.textContent = `Showing ${start}-${end} of ${this.totalItems}`;
            }
        }
    }
    
    // Start autoplay functionality
    startAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
        }
        
        this.autoplayTimer = setInterval(() => {
            const maxIndex = Math.max(0, this.totalItems - this.getVisibleItems());
            if (this.currentIndex >= maxIndex) {
                this.goTo(0); // Loop back to beginning
            } else {
                this.next();
            }
        }, this.options.autoplayInterval);
    }
    
    // Stop autoplay
    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }
}

// Home page initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize movie recommendations carousel
    const moviesCarousel = new Carousel('#moviesCarousel', {
        itemsToShow: 5,
        itemsToScroll: 1
    });
    
    // Initialize TV show recommendations carousel
    const showsCarousel = new Carousel('#showsCarousel', {
        itemsToShow: 5,
        itemsToScroll: 1
    });
    
    // Initialize latest releases carousel
    const latestCarousel = new Carousel('#latestCarousel', {
        itemsToShow: 5,
        itemsToScroll: 1
    });
    
    // Load data for homepage carousels
    if (document.querySelector('.trending-grid')) {
        // We're on the homepage
        
        // Load movie recommendations
        ApiService.getRecommendedMovies()
            .then(movies => {
                moviesCarousel.loadItems(movies);
            })
            .catch(error => {
                console.error('Error loading recommended movies:', error);
            });
        
        // Load TV show recommendations
        ApiService.getRecommendedShows()
            .then(shows => {
                showsCarousel.loadItems(shows);
            })
            .catch(error => {
                console.error('Error loading recommended shows:', error);
            });
        
        // Load latest releases
        ApiService.getLatestReleases()
            .then(latest => {
                latestCarousel.loadItems(latest);
            })
            .catch(error => {
                console.error('Error loading latest releases:', error);
            });
        
        // Load trending content
        ApiService.getTrending()
            .then(trending => {
                const trendingContainer = document.getElementById('trendingContainer');
                if (trendingContainer) {
                    trendingContainer.innerHTML = '';
                    trending.forEach(item => {
                        const col = document.createElement('div');
                        col.className = 'col';
                        col.innerHTML = createMediaCardHtml(item);
                        trendingContainer.appendChild(col);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading trending content:', error);
            });
    }
});