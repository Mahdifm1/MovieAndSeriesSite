/**
 * This script ensures all movie and TV show images display properly
 * by providing fallback options when images fail to load
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add error handler to all media poster images
    const posterImages = document.querySelectorAll('.media-poster');

    posterImages.forEach(img => {
        img.onerror = function() {
            // If the image fails to load, replace with a placeholder
            this.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1200px-No-Image-Placeholder.svg.png';
            // Remove the onerror handler to prevent infinite loops
            this.onerror = null;
        };
    });

    // Replace movie/show images with reliable sources
    const movieSources = [
        'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg', // Avengers: Endgame
        'https://m.media-amazon.com/images/M/MV5BMjMxNjY2MDU1OV5BMl5BanBnXkFtZTgwNzY1MTUwNTM@._V1_.jpg', // Avengers: Infinity War
        'https://m.media-amazon.com/images/M/MV5BMDdmMTBiNTYtMDIzNi00NGVlLWIzMDYtZTk3MTQ3NGQxZGEwXkEyXkFqcGdeQXVyMzMwOTU5MDk@._V1_.jpg', // Barbie
        'https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00ZTQ0LWJkODUtMmVhMjIwMjA1ZmQwXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_.jpg', // Top Gun: Maverick
        'https://m.media-amazon.com/images/M/MV5BNTM4NjIxNmEtYWE5NS00NDczLTkyNWQtYThhNmQyZGQzMjM0XkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg', // The Quiet Place
        'https://m.media-amazon.com/images/M/MV5BNWM0ZGJlMzMtZmYwMi00NzI3LTgzMzMtNjMzNjliNDRmZmFlXkEyXkFqcGdeQXVyMTM1MTE1NDMx._V1_.jpg', // Doctor Strange
        'https://m.media-amazon.com/images/M/MV5BMmIwZDMyYWUtNTU0ZS00ODJhLTg2ZmEtMTk5ZmYzODcxODYxXkEyXkFqcGdeQXVyMTEyMjM2NDc2._V1_.jpg', // Ghostbusters: Afterlife
        'https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFlNzAtNTVhNzM1YjI1NzMxXkEyXkFqcGdeQXVyMjQxNTE1MDA@._V1_.jpg', // Avatar: The Way of Water
        'https://m.media-amazon.com/images/M/MV5BN2FjNmEyNWMtYzM0ZS00NjIyLTg5YzYtYThlMGVjNzE1OGViXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg', // Dune
        'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg' // Inception
    ];

    const showSources = [
        'https://m.media-amazon.com/images/M/MV5BODk4ZjU0NDUtYjdlOS00OTljLTgwZTUtYjkyZjk1NzExZGU3XkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg', // Succession
        'https://m.media-amazon.com/images/M/MV5BZGExYjQzNTQtNGNhMi00YmY1LTlhY2MtMTRjODg3MjU4YTAyXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg', // Loki
        'https://m.media-amazon.com/images/M/MV5BZDE0ODVlYjktNjJiMC00ODk4LWIwNTktMWRhZmZiOGFhYmUwXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg', // Ted Lasso
        'https://m.media-amazon.com/images/M/MV5BNDVkYjU0MzctMWRmZi00NTkxLTgwZWEtOWVhYjZlYjllYmU4XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg', // Friends
        'https://m.media-amazon.com/images/M/MV5BMTg1ODEzMjc1Ml5BMl5BanBnXkFtZTgwMTMxNzQ3MDE@._V1_.jpg', // Breaking Bad
        'https://m.media-amazon.com/images/M/MV5BYTRiNDQwYzAtMzVlZS00NTI5LWJjYjUtMzkwNTUzMWMxZTllXkEyXkFqcGdeQXVyNDIzMzcwNjc@._V1_.jpg', // Game of Thrones
        'https://m.media-amazon.com/images/M/MV5BYWE3MDVkN2EtNjQ5MS00ZDQ4LTliNzYtMjc2YWMzMDEwMTA3XkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg', // Squid Game
        'https://m.media-amazon.com/images/M/MV5BMTFkZjE4NGUtMDVkMy00YWY0LWE2YTgtYjM0MmVlMzdjZWI5XkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg', // The Last of Us
        'https://m.media-amazon.com/images/M/MV5BMjIyNjk0OTgwMl5BMl5BanBnXkFtZTgwOTE4MTc4OTE@._V1_.jpg', // The Office
        'https://m.media-amazon.com/images/M/MV5BN2IzYzBiOTQtNGZmMi00NDI5LTgxMzMtN2EzZjA1NjhlOGMxXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg' // Stranger Things
    ];

    // Replace movie carousel items
    const movieItems = document.querySelectorAll('#moviesCarousel .carousel-item');
    movieItems.forEach((item, index) => {
        const img = item.querySelector('.media-poster');
        if (img) {
            img.src = movieSources[index % movieSources.length];
        }
    });

    // Replace TV show carousel items
    const showItems = document.querySelectorAll('#showsCarousel .carousel-item');
    showItems.forEach((item, index) => {
        const img = item.querySelector('.media-poster');
        if (img) {
            img.src = showSources[index % showSources.length];
        }
    });

    // Replace latest releases carousel items
    const latestItems = document.querySelectorAll('#latestCarousel .carousel-item');
    latestItems.forEach((item, index) => {
        const img = item.querySelector('.media-poster');
        if (img) {
            // Alternate between movie and show sources
            img.src = index % 2 === 0
                ? movieSources[(index / 2) % movieSources.length]
                : showSources[Math.floor(index / 2) % showSources.length];
        }
    });

    // Replace trending items
    const trendingItems = document.querySelectorAll('#trendingContainer .media-poster');
    trendingItems.forEach((img, index) => {
        // Alternate between movie and show sources
        img.src = index % 2 === 0
            ? movieSources[index % movieSources.length]
            : showSources[index % showSources.length];
    });
});