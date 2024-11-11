// Constants
const API_BASE_URL = "https://api.tvmaze.com/search/shows";
const CAROUSEL_LIMIT = 5;
// Main App Class
class MovieApp {
    constructor(){
        this.initializeElements();
        this.initializeEventListeners();
        this.watchlistManager = new StorageManager("watchlist");
        this.favoritesManager = new StorageManager("favourites");
        this.carouselManager = new CarouselManager();
    }
    initializeElements() {
        this.form = document.querySelector("form");
        this.gallery = document.querySelector(".image-container");
        this.searchInput = this.form.querySelector("input");
        this.watchlistDisplay = document.getElementById("watchlist");
        this.favouritesDisplay = document.getElementById("favourites");
    }
    initializeEventListeners() {
        this.form.addEventListener("submit", this.handleSearch.bind(this));
        window.addEventListener("load", ()=>{
            this.watchlistManager.display();
            this.favoritesManager.display();
        });
    }
    async handleSearch(e) {
        e.preventDefault();
        const query = this.searchInput.value.trim() || "nothing";
        this.searchInput.value = "";
        try {
            const shows = await this.fetchShows(query);
            this.carouselManager.updateCarousel(shows, {
                watchlistManager: this.watchlistManager,
                favoritesManager: this.favoritesManager
            });
        } catch (error) {
            this.handleError(error);
        }
    }
    async fetchShows(query) {
        try {
            const response = await fetch(`${API_BASE_URL}?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch shows: ${error.message}`);
        }
    }
    handleError(error) {
        console.error("Error:", error);
        this.showErrorNotification(error.message);
    }
    showErrorNotification(message) {
        const notification = document.createElement("div");
        notification.classList.add("error-notification");
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(()=>notification.remove(), 3000);
    }
}
// Carousel Manager Class
class CarouselManager {
    constructor(){
        this.carouselInner = document.querySelector("#topRatedCarousel .carousel-inner");
    }
    updateCarousel(shows, { watchlistManager, favoritesManager }) {
        this.clearCarousel();
        const validShows = shows.filter((show)=>show.show.image).slice(0, CAROUSEL_LIMIT);
        validShows.forEach((show, index)=>{
            this.createCarouselItem(show, index === 0, watchlistManager, favoritesManager);
        });
    }
    clearCarousel() {
        this.carouselInner.innerHTML = "";
    }
    createCarouselItem(show, isActive, watchlistManager, favoritesManager) {
        const { name, image, rating } = show.show;
        const carouselItem = document.createElement("div");
        carouselItem.classList.add("carousel-item");
        if (isActive) carouselItem.classList.add("active");
        carouselItem.innerHTML = `
            <img src="${image.original}" class="d-block w-100 carousel-image" alt="${name}">
            <div class="carousel-caption d-none d-md-block">
                <h5>${name}</h5>
                <p>Rating: ${rating?.average || "N/A"}</p>
                <div class="button-group">
                    ${this.createActionButtons(name, image.original)}
                </div>
            </div>
        `;
        // Add event listeners to buttons
        const buttons = carouselItem.querySelectorAll("button");
        buttons[0].addEventListener("click", ()=>watchlistManager.add(name, image.original));
        buttons[1].addEventListener("click", ()=>favoritesManager.add(name, image.original));
        this.carouselInner.appendChild(carouselItem);
    }
    createActionButtons(name, image) {
        return `
            <button class="btn btn-primary">Add to Watchlist</button>
            <button class="btn btn-success">Add to Favourites</button>
        `;
    }
}
// Storage Manager Class
class StorageManager {
    constructor(storageKey){
        this.storageKey = storageKey;
        this.items = JSON.parse(localStorage.getItem(storageKey)) || [];
        this.displayElement = document.getElementById(storageKey);
    }
    add(name, image) {
        if (!this.items.some((item)=>item.name === name)) {
            this.items.push({
                name,
                image
            });
            this.saveToStorage();
            this.display();
        }
    }
    remove(name) {
        this.items = this.items.filter((item)=>item.name !== name);
        this.saveToStorage();
        this.display();
    }
    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    }
    display() {
        if (!this.items.length) {
            this.displayElement.innerHTML = `<p>No items in your ${this.storageKey}.</p>`;
            return;
        }
        const carousel = this.createCarousel();
        this.displayElement.innerHTML = "";
        this.displayElement.appendChild(carousel);
    }
    createCarousel() {
        const carousel = document.createElement("div");
        carousel.classList.add("carousel", "slide");
        carousel.setAttribute("data-bs-ride", "carousel");
        carousel.id = `${this.storageKey}Carousel`;
        const carouselInner = document.createElement("div");
        carouselInner.classList.add("carousel-inner");
        this.items.forEach((item, index)=>{
            carouselInner.appendChild(this.createCarouselItem(item, index === 0));
        });
        carousel.appendChild(carouselInner);
        carousel.appendChild(this.createCarouselControl("prev"));
        carousel.appendChild(this.createCarouselControl("next"));
        return carousel;
    }
    createCarouselItem(item, isActive) {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("carousel-item");
        if (isActive) itemDiv.classList.add("active");
        itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="d-block w-100">
            <div class="carousel-caption">
                <h5>${item.name}</h5>
                <button class="btn btn-danger" onclick="app.${this.storageKey}Manager.remove('${item.name}')">
                    Remove
                </button>
            </div>
        `;
        return itemDiv;
    }
    createCarouselControl(direction) {
        const button = document.createElement("button");
        button.classList.add(`carousel-control-${direction}`);
        button.setAttribute("type", "button");
        button.setAttribute("data-bs-target", `#${this.storageKey}Carousel`);
        button.setAttribute("data-bs-slide", direction);
        button.innerHTML = `
            <span class="carousel-control-${direction}-icon" aria-hidden="true"></span>
            <span class="visually-hidden">${direction}</span>
        `;
        return button;
    }
}
// CSS for error notification
const style = document.createElement("style");
style.textContent = `
    .error-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #ff4444;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }

    .button-group {
        display: flex;
        gap: 1rem;
        justify-content: center;
    }
`;
document.head.appendChild(style);
// Initialize the app
const app = new MovieApp();
// Make app global for carousel button access
window.app = app;

//# sourceMappingURL=index.18dd1764.js.map
