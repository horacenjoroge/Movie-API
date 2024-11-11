# Movie Review Platform

# MovieRatings - Search, Review, and Track Your Favorite Movies

## Table of Contents
- [About](#about)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## About
MovieRatings is a web platform that allows users to search for movies, add reviews, and manage their watchlist and favorites. It leverages The TV Maze API for movie data and enables users to interact with movie data by adding ratings, reviews, and more.

## Features
- **Search Movies:** Find movies using keywords
- **User Reviews and Ratings:** Add and manage movie reviews and ratings
- **Watchlist and Favorites:** Keep track of your favorite movies and those you want to watch later
- **Responsive Design:** Works seamlessly across desktop and mobile devices
- **Local Storage:** Saves your preferences and lists locally in your browser

## Installation

### Prerequisites
- **Git:** Ensure Git is installed. [Download Git](https://git-scm.com/downloads)
- **Node.js and npm:** Install Node.js, which comes with npm. [Download Node.js](https://nodejs.org/)

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/horacenjoroge/MovieRatings.git
   ```

2. **Navigate to the Project Directory**
   ```bash
   cd MovieRatings
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run the Application**
   ```bash
   npm start
   ```

5. **Access the Application**
   Open your browser and go to `http://localhost:1234` to see the application in action.

## Usage

### Search for Movies
1. Use the search bar at the top of the page
2. Enter keywords related to the movie you're looking for
3. Results will appear in the carousel below

### Managing Reviews and Ratings
1. Click on a movie to view its details
2. Use the "Add Review" button to write your review
3. Select a rating from 1 to 5 stars
4. Submit your review to save it

### Watchlist and Favorites
- Click "Add to Watchlist" to save movies you want to watch later
- Click "Add to Favorites" to keep track of your favorite movies
- Access your lists from the navigation menu
- Remove items from your lists using the remove button

## Project Structure
```
MovieRatings/
├── index.html
├── movie.css
├── movie.js
├── package.json
└── README.md
```

## Technologies Used
- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- TV Maze API
- Parcel Bundler

## Contributing
Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgments
- TV Maze API for providing movie data
- Bootstrap for the responsive design framework
- Font Awesome for icons
