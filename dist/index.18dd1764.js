// Constants and Configuration
const CONFIG = {
    API_BASE_URL: "https://api.tvmaze.com/search/shows",
    CAROUSEL_LIMIT: 5,
    FAVORITES_LIMIT: 4,
    NOTIFICATION_DURATION: 3000,
    IMAGE_LAZY_LOADING: true,
    STORAGE_KEYS: {
        WATCHLIST: "watchlist",
        FAVORITES: "favorites",
        REVIEWS: "movie-reviews"
    },
    MAX_RATING: 5
};
// Utility Functions
const debounce = (func, wait)=>{
    let timeout;
    return function executedFunction(...args) {
        const later = ()=>{
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
const sanitizeString = (str)=>{
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML.replace(/"/g, "&quot;");
};
// New Review Manager Class
class ReviewManager {
    constructor(){
        this.reviews = this.loadReviews();
        this.reviewForm = document.querySelector(".review-form");
        this.reviewsDisplay = document.getElementById("reviews-display");
        this.setupEventListeners();
    }
    loadReviews() {
        try {
            const reviews = localStorage.getItem(CONFIG.STORAGE_KEYS.REVIEWS);
            return reviews ? JSON.parse(reviews) : {};
        } catch (error) {
            console.error("Error loading reviews:", error);
            return {};
        }
    }
    setupEventListeners() {
        if (!this.reviewForm) return;
        this.reviewForm.addEventListener("submit", (e)=>{
            e.preventDefault();
            const reviewText = document.getElementById("review-text").value;
            const rating = document.getElementById("rating").value;
            const movieId = this.reviewForm.dataset.movieId;
            const movieName = this.reviewForm.dataset.movieName;
            if (movieId && movieName) this.addReview(movieId, movieName, reviewText, rating);
            else app.notificationManager.show("Please select a movie to review", "error");
        });
    }
    addReview(movieId, movieName, reviewText, rating) {
        if (!movieId || !reviewText || !rating) return;
        const review = {
            movieId,
            movieName,
            reviewText,
            rating: Number(rating),
            date: new Date().toISOString()
        };
        if (!this.reviews[movieId]) this.reviews[movieId] = [];
        this.reviews[movieId].push(review);
        this.saveReviews();
        this.displayReviews();
        this.resetForm();
        app.notificationManager.show("Review added successfully", "success");
    }
    saveReviews() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));
        } catch (error) {
            console.error("Error saving reviews:", error);
        }
    }
    displayReviews() {
        if (!this.reviewsDisplay) return;
        this.reviewsDisplay.innerHTML = "";
        let hasReviews = false;
        Object.values(this.reviews).flat().sort((a, b)=>{
            return new Date(b.date) - new Date(a.date);
        }).forEach((review)=>{
            hasReviews = true;
            const reviewElement = this.createReviewElement(review);
            this.reviewsDisplay.appendChild(reviewElement);
        });
        if (!hasReviews) this.reviewsDisplay.innerHTML = '<p class="text-center">No reviews yet. Watch some movies and share your thoughts!</p>';
    }
    createReviewElement(review) {
        const reviewDiv = document.createElement("div");
        reviewDiv.className = "review-item mb-3 p-3 bg-white rounded shadow-sm";
        const stars = "\u2605".repeat(review.rating) + "\u2606".repeat(CONFIG.MAX_RATING - review.rating);
        const date = new Date(review.date).toLocaleDateString();
        reviewDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h4 class="movie-title h5 mb-0">${sanitizeString(review.movieName)}</h4>
                <span class="text-warning">${stars}</span>
            </div>
            <p class="review-text mb-2">${sanitizeString(review.reviewText)}</p>
            <div class="text-muted small">
                <em>Reviewed on ${date}</em>
                <button class="btn btn-sm btn-outline-danger float-end delete-review" 
                        data-movie-id="${review.movieId}">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        `;
        reviewDiv.querySelector(".delete-review").addEventListener("click", ()=>{
            this.deleteReview(review.movieId, review.date);
        });
        return reviewDiv;
    }
    deleteReview(movieId, date) {
        if (this.reviews[movieId]) {
            this.reviews[movieId] = this.reviews[movieId].filter((r)=>r.date !== date);
            if (this.reviews[movieId].length === 0) delete this.reviews[movieId];
            this.saveReviews();
            this.displayReviews();
            app.notificationManager.show("Review deleted", "success");
        }
    }
    resetForm() {
        if (this.reviewForm) {
            this.reviewForm.reset();
            delete this.reviewForm.dataset.movieId;
            delete this.reviewForm.dataset.movieName;
        }
    }
    getMovieRating(movieId) {
        if (!this.reviews[movieId]) return null;
        const ratings = this.reviews[movieId].map((r)=>r.rating);
        const average = ratings.reduce((a, b)=>a + b, 0) / ratings.length;
        return average.toFixed(1);
    }
    hasReviewedMovie(movieId) {
        return !!this.reviews[movieId]?.length;
    }
}
// Main App Class
class MovieApp {
    constructor(){
        this.initializeElements();
        this.reviewManager = new ReviewManager(); // Initialize reviewManager first
        this.initializeEventListeners();
        this.watchlistManager = new StorageManager(CONFIG.STORAGE_KEYS.WATCHLIST);
        this.favoritesManager = new StorageManager(CONFIG.STORAGE_KEYS.FAVORITES);
        this.carouselManager = new CarouselManager(this.reviewManager); // Pass reviewManager
        this.notificationManager = new NotificationManager();
    }
    initializeElements() {
        this.form = document.querySelector(".search-form");
        this.gallery = document.querySelector(".image-container");
        this.searchInput = this.form?.querySelector('input[type="search"]');
        this.loadingIndicator = document.querySelector(".loading");
        if (!this.form || !this.gallery || !this.searchInput) throw new Error("Required elements not found");
    }
    initializeEventListeners() {
        this.form.addEventListener("submit", this.handleSearch.bind(this));
        this.searchInput.addEventListener("input", debounce((e)=>{
            const isValid = e.target.checkValidity();
            e.target.setAttribute("aria-invalid", !isValid);
        }, 300));
        window.addEventListener("DOMContentLoaded", ()=>{
            this.watchlistManager.display();
            this.favoritesManager.display();
        });
        window.addEventListener("online", ()=>{
            this.notificationManager.show("Connection restored", "success");
        });
        window.addEventListener("offline", ()=>{
            this.notificationManager.show("No internet connection", "error");
        });
    }
    async handleSearch(e) {
        e.preventDefault();
        const query = sanitizeString(this.searchInput.value.trim());
        if (!query) {
            this.notificationManager.show("Please enter a search term", "error");
            return;
        }
        this.setLoading(true);
        try {
            const shows = await this.fetchShows(query);
            await this.carouselManager.updateCarousel(shows, {
                watchlistManager: this.watchlistManager,
                favoritesManager: this.favoritesManager
            });
            this.searchInput.value = "";
        } catch (error) {
            this.notificationManager.show(error.message, "error");
            console.error("Search error:", error);
        } finally{
            this.setLoading(false);
        }
    }
    setLoading(isLoading) {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = isLoading ? "flex" : "none";
            this.loadingIndicator.setAttribute("aria-busy", isLoading);
        }
    }
    async fetchShows(query) {
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), 5000);
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}?q=${encodeURIComponent(query)}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (error.name === "AbortError") throw new Error("Request timed out");
            throw new Error(`Failed to fetch shows: ${error.message}`);
        }
    }
}
// Notification Manager Class
class NotificationManager {
    constructor(){
        this.container = document.createElement("div");
        this.container.className = "notification-container";
        this.container.setAttribute("role", "alert");
        this.container.setAttribute("aria-live", "polite");
        document.body.appendChild(this.container);
    }
    show(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        this.container.appendChild(notification);
        setTimeout(()=>{
            notification.classList.add("fade-out");
            setTimeout(()=>notification.remove(), 300);
        }, CONFIG.NOTIFICATION_DURATION);
    }
}
// Carousel Manager Class
class CarouselManager {
    constructor(reviewManager){
        this.carouselInner = document.querySelector("#topRatedCarousel .carousel-inner");
        this.initializeIntersectionObserver();
        this.notificationManager = new NotificationManager();
        this.reviewManager = reviewManager;
    }
    initializeIntersectionObserver() {
        this.observer = new IntersectionObserver((entries)=>{
            entries.forEach((entry)=>{
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute("data-src");
                        this.observer.unobserve(img);
                    }
                }
            });
        }, {
            threshold: 0.1
        });
    }
    async updateCarousel(shows, { watchlistManager, favoritesManager }) {
        if (!this.carouselInner) return;
        this.carouselInner.innerHTML = "";
        const validShows = shows.filter((show)=>show.show.image?.original).slice(0, CONFIG.CAROUSEL_LIMIT);
        validShows.forEach((show, index)=>{
            this.createCarouselItem(show, index === 0, watchlistManager, favoritesManager);
        });
    }
    createCarouselItem(show, isActive, watchlistManager, favoritesManager) {
        const { id, name, image, rating } = show.show;
        if (!name || !image?.original) {
            console.error("Invalid show data:", show);
            return;
        }
        const sanitizedName = sanitizeString(name);
        const sanitizedImage = sanitizeString(image.original);
        // Use this.reviewManager instead of app.reviewManager
        const userRating = this.reviewManager.getMovieRating(id);
        const hasReview = this.reviewManager.hasReviewedMovie(id);
        const carouselItem = document.createElement("div");
        carouselItem.classList.add("carousel-item");
        if (isActive) carouselItem.classList.add("active");
        carouselItem.innerHTML = `
            <img data-src="${sanitizedImage}" 
                 class="d-block w-100 carousel-image" 
                 alt="${sanitizedName}"
                 src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"
                 onerror="this.src='https://via.placeholder.com/1200x675?text=No+Image'">
            <div class="carousel-caption d-none d-md-block">
                <h5>${sanitizedName}</h5>
                <p>TVDB Rating: ${rating?.average || "N/A"}</p>
                ${userRating ? `<p class="user-rating">Your Rating: ${userRating} \u{2605}</p>` : ""}
                <div class="button-group">
                    <button class="btn btn-primary watchlist-btn" aria-label="Add ${sanitizedName} to Watchlist">
                        <i class="fas fa-list me-2" aria-hidden="true"></i>Add to Watchlist
                    </button>
                    <button class="btn btn-success favorite-btn" aria-label="Add ${sanitizedName} to Favorites">
                        <i class="fas fa-heart me-2" aria-hidden="true"></i>Add to Favorites
                    </button>
                    <button class="btn btn-info review-btn" 
                            aria-label="${hasReview ? "Update" : "Add"} review for ${sanitizedName}">
                        <i class="fas fa-star me-2" aria-hidden="true"></i>
                        ${hasReview ? "Update Review" : "Add Review"}
                    </button>
                </div>
            </div>
        `;
        const watchlistBtn = carouselItem.querySelector(".watchlist-btn");
        const favoriteBtn = carouselItem.querySelector(".favorite-btn");
        const reviewBtn = carouselItem.querySelector(".review-btn");
        watchlistBtn.addEventListener("click", ()=>{
            watchlistManager.add(name, image.original);
            this.notificationManager.show("Added to watchlist", "success");
        });
        favoriteBtn.addEventListener("click", ()=>{
            favoritesManager.add(name, image.original);
            this.notificationManager.show("Added to favorites", "success");
        });
        reviewBtn.addEventListener("click", ()=>{
            const reviewForm = document.querySelector(".review-form");
            if (reviewForm) {
                reviewForm.dataset.movieId = id;
                reviewForm.dataset.movieName = name;
            }
        });
        const img = carouselItem.querySelector("img");
        if (CONFIG.IMAGE_LAZY_LOADING && this.observer) this.observer.observe(img);
        this.carouselInner.appendChild(carouselItem);
    }
}
// Storage Manager Class
class StorageManager {
    constructor(storageKey){
        this.storageKey = storageKey;
        this.items = this.loadFromStorage();
        this.displayElement = document.getElementById(`${storageKey}-movies`);
        // Add event delegation for remove buttons
        this.displayElement?.addEventListener("click", (e)=>{
            if (e.target.closest(".remove-btn")) {
                const name = e.target.closest(".remove-btn").dataset.name;
                this.remove(name);
            }
        });
    }
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error loading ${this.storageKey}:`, error);
            return [];
        }
    }
    add(name, image) {
        if (!name || !image) {
            console.error("Invalid movie data:", {
                name,
                image
            });
            return;
        }
        if (!this.items.some((item)=>item.name === name)) {
            if (this.storageKey === CONFIG.STORAGE_KEYS.FAVORITES && this.items.length >= CONFIG.FAVORITES_LIMIT) this.items.shift();
            this.items.push({
                name,
                image
            });
            this.saveToStorage();
            this.display();
        }
    }
    remove(name) {
        if (!name) return;
        console.log(`Removing ${name} from ${this.storageKey}`); // Debug log
        this.items = this.items.filter((item)=>item.name !== name);
        this.saveToStorage();
        this.display();
    }
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
            console.log(`Saved ${this.storageKey}:`, this.items); // Debug log
        } catch (error) {
            console.error(`Error saving ${this.storageKey}:`, error);
        }
    }
    display() {
        if (!this.displayElement) {
            console.error(`Display element for ${this.storageKey} not found`);
            return;
        }
        if (!this.items.length) {
            this.displayElement.innerHTML = `
                <p class="text-center">No items in your ${this.storageKey}.</p>
            `;
            return;
        }
        this.displayGrid();
    }
    displayGrid() {
        this.displayElement.innerHTML = "";
        const container = document.createElement("div");
        container.classList.add(`${this.storageKey}-grid`);
        const itemsToDisplay = this.storageKey === CONFIG.STORAGE_KEYS.FAVORITES ? this.items.slice(-CONFIG.FAVORITES_LIMIT) : this.items;
        itemsToDisplay.forEach((item, index)=>{
            if (item && item.name && item.image) {
                const card = this.createMovieCard(item, index);
                container.appendChild(card);
            }
        });
        this.displayElement.appendChild(container);
    }
    createMovieCard(item, index) {
        const sanitizedName = sanitizeString(item.name);
        const sanitizedImage = sanitizeString(item.image);
        const card = document.createElement("div");
        card.classList.add("movie-card");
        card.innerHTML = `
            <div class="movie-card-inner">
                <img src="${sanitizedImage}" 
                     alt="${sanitizedName}" 
                     class="movie-image"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="movie-info">
                    <h3 class="movie-title">${sanitizedName}</h3>
                    <button class="btn btn-danger remove-btn" 
                            data-name="${sanitizedName}"
                            aria-label="Remove ${sanitizedName}">
                        <i class="fas fa-trash-alt me-2" aria-hidden="true"></i>Remove
                    </button>
                </div>
            </div>
        `;
        return card;
    }
    clear() {
        this.items = [];
        this.saveToStorage();
        this.display();
    }
}
// Initialize the app
try {
    window.app = new MovieApp();
} catch (error) {
    console.error("Failed to initialize application:", error);
    const errorMessage = document.createElement("div");
    errorMessage.className = "alert alert-danger m-3";
    errorMessage.setAttribute("role", "alert");
    errorMessage.textContent = "Failed to initialize application. Please refresh the page.";
    document.body.prepend(errorMessage);
}
// Debug function to clear storage
window.clearStorage = ()=>{
    app.watchlistManager.clear();
    app.favoritesManager.clear();
    // Add this line to clear reviews too
    localStorage.removeItem(CONFIG.STORAGE_KEYS.REVIEWS);
    console.log("Storage cleared");
};

//# sourceMappingURL=index.18dd1764.js.map
