const e={API_BASE_URL:"https://api.tvmaze.com/search/shows",CAROUSEL_LIMIT:5,FAVORITES_LIMIT:4,NOTIFICATION_DURATION:3e3,IMAGE_LAZY_LOADING:!0,STORAGE_KEYS:{WATCHLIST:"reelrate_watchlist",FAVORITES:"reelrate_favorites",REVIEWS:"reelrate_reviews",MOVIE_LIST:"reelrate_movie_list"},MAX_RATING:5},t=(e,t)=>{let i;return function(...s){clearTimeout(i),i=setTimeout(()=>{clearTimeout(i),e(...s)},t)}},i=e=>{let t=document.createElement("div");return t.textContent=e,t.innerHTML.replace(/"/g,"&quot;")};class s{constructor(){this.movieListingsContainer=document.getElementById("movieListings"),this.movies=this.loadMovies()}loadMovies(){try{let t=localStorage.getItem(e.STORAGE_KEYS.MOVIE_LIST);return t?JSON.parse(t):[]}catch(e){return console.error("Error loading movies:",e),[]}}saveMovies(){try{localStorage.setItem(e.STORAGE_KEYS.MOVIE_LIST,JSON.stringify(this.movies))}catch(e){console.error("Error saving movies:",e)}}updateMovieList(e){e&&Array.isArray(e)&&(this.movies=e.map(e=>({id:e.show.id,name:e.show.name,image:e.show.image?.original||null,rating:e.show.rating?.average||"N/A"})),this.saveMovies(),this.display())}display(){if(!this.movieListingsContainer){console.error("Movie listings container not found");return}if(this.movieListingsContainer.innerHTML="",!this.movies.length){this.movieListingsContainer.innerHTML='<p class="text-center text-light">No results found.</p>';return}let e=document.createElement("div");e.className="movie-listings-grid",this.movies.forEach(t=>{let i=this.createMovieCard(t);e.appendChild(i)}),this.movieListingsContainer.appendChild(e)}createMovieCard(e){let t=document.createElement("div");return t.className="movie-card",t.innerHTML=`
            <div class="movie-card-inner">
                <img src="${e.image||"https://via.placeholder.com/300x450?text=No+Image"}" 
                     alt="${i(e.name)}" 
                     class="movie-image"
                     loading="lazy" 
                     onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="movie-info">
                    <h3 class="movie-title">${i(e.name)}</h3>
                    <p class="movie-rating">Rating: ${e.rating}</p>
                    <button class="btn btn-info review-btn" 
                            data-movie-id="${e.id}"
                            data-movie-name="${i(e.name)}"
                            aria-label="Review ${i(e.name)}">
                        <i class="fas fa-star me-2"></i>Review
                    </button>
                </div>
            </div>
        `,t.querySelector(".review-btn").addEventListener("click",()=>{let t=document.querySelector(".review-form");t&&(t.dataset.movieId=e.id,t.dataset.movieName=e.name,t.scrollIntoView({behavior:"smooth"}))}),t}}class a{constructor(){this.reviews=this.loadReviews(),this.reviewForm=document.querySelector(".review-form"),this.reviewsDisplay=document.getElementById("reviews-display"),this.setupEventListeners()}loadReviews(){try{let t=localStorage.getItem(e.STORAGE_KEYS.REVIEWS);return t?JSON.parse(t):{}}catch(e){return console.error("Error loading reviews:",e),{}}}setupEventListeners(){this.reviewForm&&this.reviewForm.addEventListener("submit",e=>{e.preventDefault();let t=document.getElementById("review-text").value,i=document.getElementById("rating").value,s=this.reviewForm.dataset.movieId,a=this.reviewForm.dataset.movieName;s&&a?this.addReview(s,a,t,i):app.notificationManager.show("Please select a movie to review","error")})}addReview(e,t,i,s){if(!e||!i||!s)return;let a={movieId:e,movieName:t,reviewText:i,rating:Number(s),date:new Date().toISOString()};this.reviews[e]||(this.reviews[e]=[]),this.reviews[e].push(a),this.saveReviews(),this.displayReviews(),this.resetForm(),app.notificationManager.show("Review added successfully","success")}saveReviews(){try{localStorage.setItem(e.STORAGE_KEYS.REVIEWS,JSON.stringify(this.reviews))}catch(e){console.error("Error saving reviews:",e)}}displayReviews(){if(!this.reviewsDisplay)return;this.reviewsDisplay.innerHTML="";let e=!1;Object.values(this.reviews).flat().sort((e,t)=>new Date(t.date)-new Date(e.date)).forEach(t=>{e=!0;let i=this.createReviewElement(t);this.reviewsDisplay.appendChild(i)}),e||(this.reviewsDisplay.innerHTML='<p class="text-center">No reviews yet. Watch some movies and share your thoughts!</p>')}createReviewElement(t){let s=document.createElement("div");s.className="review-item mb-3 p-3 bg-white rounded shadow-sm";let a="★".repeat(t.rating)+"☆".repeat(e.MAX_RATING-t.rating),r=new Date(t.date).toLocaleDateString();return s.innerHTML=`
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h4 class="movie-title h5 mb-0">${i(t.movieName)}</h4>
                <span class="text-warning">${a}</span>
            </div>
            <p class="review-text mb-2">${i(t.reviewText)}</p>
            <div class="text-muted small">
                <em>Reviewed on ${r}</em>
                <button class="btn btn-sm btn-outline-danger float-end delete-review" 
                        data-movie-id="${t.movieId}">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        `,s.querySelector(".delete-review").addEventListener("click",()=>{this.deleteReview(t.movieId,t.date)}),s}deleteReview(e,t){this.reviews[e]&&(this.reviews[e]=this.reviews[e].filter(e=>e.date!==t),0===this.reviews[e].length&&delete this.reviews[e],this.saveReviews(),this.displayReviews(),app.notificationManager.show("Review deleted","success"))}resetForm(){this.reviewForm&&(this.reviewForm.reset(),delete this.reviewForm.dataset.movieId,delete this.reviewForm.dataset.movieName)}getMovieRating(e){if(!this.reviews[e])return null;let t=this.reviews[e].map(e=>e.rating);return(t.reduce((e,t)=>e+t,0)/t.length).toFixed(1)}hasReviewedMovie(e){return!!this.reviews[e]?.length}}class r{constructor(){this.container=document.createElement("div"),this.container.className="notification-container",this.container.setAttribute("role","alert"),this.container.setAttribute("aria-live","polite"),document.body.appendChild(this.container)}show(t,i="info"){let s=document.createElement("div");s.className=`notification notification-${i}`,s.textContent=t,this.container.appendChild(s),setTimeout(()=>{s.classList.add("fade-out"),setTimeout(()=>s.remove(),300)},e.NOTIFICATION_DURATION)}}class o{constructor(e){this.carouselInner=document.querySelector("#topRatedCarousel .carousel-inner"),this.initializeIntersectionObserver(),this.notificationManager=new r,this.reviewManager=e}initializeIntersectionObserver(){this.observer=new IntersectionObserver(e=>{e.forEach(e=>{if(e.isIntersecting){let t=e.target;t.dataset.src&&(t.src=t.dataset.src,t.removeAttribute("data-src"),this.observer.unobserve(t))}})},{threshold:.1})}async updateCarousel(t,{watchlistManager:i,favoritesManager:s}){this.carouselInner&&(this.carouselInner.innerHTML="",t.filter(e=>e.show.image?.original).slice(0,e.CAROUSEL_LIMIT).forEach((e,t)=>{this.createCarouselItem(e,0===t,i,s)}))}createCarouselItem(t,s,a,r){let{id:o,name:n,image:l,rating:c}=t.show;if(!n||!l?.original){console.error("Invalid show data:",t);return}let d=i(n),h=i(l.original),m=this.reviewManager.getMovieRating(o),v=this.reviewManager.hasReviewedMovie(o),g=document.createElement("div");g.classList.add("carousel-item"),s&&g.classList.add("active"),g.innerHTML=`
            <img data-src="${h}" 
                 class="d-block w-100 carousel-image" 
                 alt="${d}"
                 src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"
                 onerror="this.src='https://via.placeholder.com/1200x675?text=No+Image'">
            <div class="carousel-caption d-none d-md-block">
                <h5>${d}</h5>
                <p>TVDB Rating: ${c?.average||"N/A"}</p>
                ${m?`<p class="user-rating">Your Rating: ${m} \u{2605}</p>`:""}
                <div class="button-group">
                    <button class="btn btn-primary watchlist-btn" aria-label="Add ${d} to Watchlist">
                        <i class="fas fa-list me-2" aria-hidden="true"></i>Add to Watchlist
                    </button>
                    <button class="btn btn-success favorite-btn" aria-label="Add ${d} to Favorites">
                        <i class="fas fa-heart me-2" aria-hidden="true"></i>Add to Favorites
                    </button>
                    <button class="btn btn-info review-btn" 
                            aria-label="${v?"Update":"Add"} review for ${d}">
                        <i class="fas fa-star me-2" aria-hidden="true"></i>
                        ${v?"Update Review":"Add Review"}
                    </button>
                </div>
            </div>
        `;let u=g.querySelector(".watchlist-btn"),w=g.querySelector(".favorite-btn"),p=g.querySelector(".review-btn");u.addEventListener("click",()=>{a.add(n,l.original),this.notificationManager.show("Added to watchlist","success")}),w.addEventListener("click",()=>{r.add(n,l.original),this.notificationManager.show("Added to favorites","success")}),p.addEventListener("click",()=>{let e=document.querySelector(".review-form");e&&(e.dataset.movieId=o,e.dataset.movieName=n)});let E=g.querySelector("img");e.IMAGE_LAZY_LOADING&&this.observer&&this.observer.observe(E),this.carouselInner.appendChild(g)}}class n{constructor(e){this.storageKey=e,this.items=this.loadFromStorage(),this.displayElement=document.getElementById(`${e}-movies`),this.displayElement?.addEventListener("click",e=>{if(e.target.closest(".remove-btn")){let t=e.target.closest(".remove-btn").dataset.name;this.remove(t)}})}loadFromStorage(){try{let e=localStorage.getItem(this.storageKey);return e?JSON.parse(e):[]}catch(e){return console.error(`Error loading ${this.storageKey}:`,e),[]}}add(t,i){if(!t||!i){console.error("Invalid movie data:",{name:t,image:i});return}this.items.some(e=>e.name===t)||(this.storageKey===e.STORAGE_KEYS.FAVORITES&&this.items.length>=e.FAVORITES_LIMIT&&this.items.shift(),this.items.push({name:t,image:i}),this.saveToStorage(),this.display())}remove(e){e&&(console.log(`Removing ${e} from ${this.storageKey}`),this.items=this.items.filter(t=>t.name!==e),this.saveToStorage(),this.display())}saveToStorage(){try{localStorage.setItem(this.storageKey,JSON.stringify(this.items)),console.log(`Saved ${this.storageKey}:`,this.items)}catch(e){console.error(`Error saving ${this.storageKey}:`,e)}}display(){if(!this.displayElement){console.error(`Display element for ${this.storageKey} not found`);return}if(!this.items.length){this.displayElement.innerHTML=`
                <p class="text-center">No items in your ${this.storageKey}.</p>
            `;return}this.displayGrid()}displayGrid(){this.displayElement.innerHTML="";let t=document.createElement("div");t.classList.add(`${this.storageKey}-grid`),(this.storageKey===e.STORAGE_KEYS.FAVORITES?this.items.slice(-e.FAVORITES_LIMIT):this.items).forEach((e,i)=>{if(e&&e.name&&e.image){let s=this.createMovieCard(e,i);t.appendChild(s)}}),this.displayElement.appendChild(t)}createMovieCard(e,t){let s=i(e.name),a=i(e.image),r=document.createElement("div");return r.classList.add("movie-card"),r.innerHTML=`
            <div class="movie-card-inner">
                <img src="${a}" 
                     alt="${s}" 
                     class="movie-image"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="movie-info">
                    <h3 class="movie-title">${s}</h3>
                    <button class="btn btn-danger remove-btn" 
                            data-name="${s}"
                            aria-label="Remove ${s}">
                        <i class="fas fa-trash-alt me-2" aria-hidden="true"></i>Remove
                    </button>
                </div>
            </div>
        `,r}clear(){this.items=[],this.saveToStorage(),this.display()}}try{window.app=new class{constructor(){this.initializeElements(),this.reviewManager=new a,this.movieListManager=new s,this.initializeEventListeners(),this.watchlistManager=new n(e.STORAGE_KEYS.WATCHLIST),this.favoritesManager=new n(e.STORAGE_KEYS.FAVORITES),this.carouselManager=new o(this.reviewManager),this.notificationManager=new r}initializeElements(){if(this.form=document.querySelector(".search-form"),this.gallery=document.querySelector(".image-container"),this.searchInput=this.form?.querySelector('input[type="search"]'),this.loadingIndicator=document.querySelector(".loading"),this.movieListingsContainer=document.getElementById("movieListings"),!this.form||!this.gallery||!this.searchInput)throw Error("Required elements not found")}initializeEventListeners(){this.form.addEventListener("submit",this.handleSearch.bind(this)),this.searchInput.addEventListener("input",t(e=>{let t=e.target.checkValidity();e.target.setAttribute("aria-invalid",!t)},300)),window.addEventListener("DOMContentLoaded",()=>{this.watchlistManager.display(),this.favoritesManager.display()}),window.addEventListener("online",()=>{this.notificationManager.show("Connection restored","success")}),window.addEventListener("offline",()=>{this.notificationManager.show("No internet connection","error")})}async handleSearch(e){e.preventDefault();let t=i(this.searchInput.value.trim());if(!t){this.notificationManager.show("Please enter a search term","error");return}this.setLoading(!0);try{let e=await this.fetchShows(t);await this.carouselManager.updateCarousel(e,{watchlistManager:this.watchlistManager,favoritesManager:this.favoritesManager}),this.movieListManager.updateMovieList(e),this.searchInput.value=""}catch(e){this.notificationManager.show(e.message,"error"),console.error("Search error:",e)}finally{this.setLoading(!1)}}setLoading(e){this.loadingIndicator&&(this.loadingIndicator.style.display=e?"flex":"none",this.loadingIndicator.setAttribute("aria-busy",e))}async fetchShows(t){let i=new AbortController,s=setTimeout(()=>i.abort(),5e3);try{let a=await fetch(`${e.API_BASE_URL}?q=${encodeURIComponent(t)}`,{signal:i.signal});if(clearTimeout(s),!a.ok)throw Error(`HTTP error! status: ${a.status}`);return await a.json()}catch(e){if("AbortError"===e.name)throw Error("Request timed out");throw Error(`Failed to fetch shows: ${e.message}`)}}}}catch(t){console.error("Failed to initialize application:",t);let e=document.createElement("div");e.className="alert alert-danger m-3",e.setAttribute("role","alert"),e.textContent="Failed to initialize application. Please refresh the page.",document.body.prepend(e)}window.clearStorage=()=>{app.watchlistManager.clear(),app.favoritesManager.clear(),localStorage.removeItem(e.STORAGE_KEYS.REVIEWS),console.log("Storage cleared")};
//# sourceMappingURL=index.c6bf83b2.js.map
