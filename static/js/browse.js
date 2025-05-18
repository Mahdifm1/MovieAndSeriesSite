// Browse page functionality for StreamSense

// Global variables
let currentFilters = {
    type: 'all',
    year: 'all',
    rating: 'all',
    genre: 'all',
    actor: ''
};
let currentPage = 1;
let totalPages = 1;

// Initialize browse page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the browse page
    const browseResults = document.getElementById('browseResults');
    if (!browseResults) return;
    
    // Set up filter form submission
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const typeFilter = document.getElementById('typeFilter').value;
            const yearFilter = document.getElementById('yearFilter').value;
            const ratingFilter = document.getElementById('ratingFilter').value;
            const genreFilter = document.getElementById('genreFilter').value;
            const actorFilter = document.getElementById('actorFilter').value;
            
            // Update current filters
            currentFilters = {
                type: typeFilter,
                year: yearFilter,
                rating: ratingFilter,
                genre: genreFilter,
                actor: actorFilter
            };
            
            // Reset to first page and load results
            currentPage = 1;
            loadBrowseResults();
        });
    }
    
    // Set up reset filters button
    const resetFiltersBtn = document.getElementById('resetFilters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            // Reset form fields
            document.getElementById('typeFilter').value = 'all';
            document.getElementById('yearFilter').value = 'all';
            document.getElementById('ratingFilter').value = 'all';
            document.getElementById('genreFilter').value = 'all';
            document.getElementById('actorFilter').value = '';
            
            // Reset filters and reload
            currentFilters = {
                type: 'all',
                year: 'all',
                rating: 'all',
                genre: 'all',
                actor: ''
            };
            
            currentPage = 1;
            loadBrowseResults();
        });
    }
    
    // Set up pagination
    setupPagination();
    
    // Initial load of browse results
    loadBrowseResults();
});

// Load browse results with current filters and page
function loadBrowseResults() {
    const resultsContainer = document.getElementById('browseResults');
    if (!resultsContainer) return;
    
    // Show loading state
    resultsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading results...</p>
        </div>
    `;
    
    // Fetch results from API
    ApiService.getBrowseContent(currentFilters, currentPage)
        .then(response => {
            const { results, pagination } = response;
            
            // Update total pages
            totalPages = pagination.totalPages;
            
            // Update results count
            const resultsCount = document.getElementById('resultsCount');
            if (resultsCount) {
                const start = (pagination.currentPage - 1) * pagination.pageSize + 1;
                const end = Math.min(start + results.length - 1, pagination.totalItems);
                resultsCount.textContent = `Showing ${start}-${end} of ${pagination.totalItems} results`;
            }
            
            // Render results
            renderBrowseResults(results);
            
            // Update pagination
            updatePagination(pagination.currentPage, pagination.totalPages);
        })
        .catch(error => {
            console.error('Error loading browse results:', error);
            resultsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        Failed to load results. Please try again later.
                    </div>
                </div>
            `;
        });
}

// Render browse results in the container
function renderBrowseResults(results) {
    const resultsContainer = document.getElementById('browseResults');
    if (!resultsContainer) return;
    
    // Clear container
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        // No results found
        resultsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-info" role="alert">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    No results found matching your filters. Try adjusting your search criteria.
                </div>
            </div>
        `;
        return;
    }
    
    // Render each result
    results.forEach(item => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = createMediaCardHtml(item);
        resultsContainer.appendChild(col);
    });
}

// Set up pagination event listeners
function setupPagination() {
    const pagination = document.getElementById('resultsPagination');
    if (!pagination) return;
    
    // Add click event listener for pagination links
    pagination.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Find the clicked link
        const link = e.target.closest('a.page-link');
        if (!link) return;
        
        // Get the page number or action
        const pageText = link.textContent.trim();
        const parentItem = link.parentElement;
        
        if (pageText === '«') {
            // Previous page
            if (!parentItem.classList.contains('disabled')) {
                currentPage = Math.max(1, currentPage - 1);
                loadBrowseResults();
            }
        } else if (pageText === '»') {
            // Next page
            if (!parentItem.classList.contains('disabled')) {
                currentPage = Math.min(totalPages, currentPage + 1);
                loadBrowseResults();
            }
        } else {
            // Specific page number
            const pageNum = parseInt(pageText);
            if (!isNaN(pageNum) && pageNum !== currentPage) {
                currentPage = pageNum;
                loadBrowseResults();
            }
        }
    });
}

// Update pagination UI based on current page and total pages
function updatePagination(currentPage, totalPages) {
    const pagination = document.getElementById('resultsPagination');
    if (!pagination) return;
    
    // Clear current pagination
    pagination.innerHTML = '';
    
    // Previous button
    const prevItem = document.createElement('li');
    prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevItem.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    pagination.appendChild(prevItem);
    
    // Determine which page numbers to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4 && totalPages > 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pagination.appendChild(pageItem);
    }
    
    // Next button
    const nextItem = document.createElement('li');
    nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextItem.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    pagination.appendChild(nextItem);
}