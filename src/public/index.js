document.addEventListener('DOMContentLoaded', () => {
    fetchConfig().then(config => {
        fetchNewestMovies(config);
    });
});

async function fetchConfig() {
    try {
        let response = await fetch('env.json');
        let config = await response.json();
        return config;
    } catch (error) {
        console.error('Error loading configuration:', error);
    }
}

async function fetchNewestMovies(config) {
    let { api_url, api_key } = config;
    let newMovies = `${api_url}movie/now_playing?api_key=${api_key}&language=en-US&page=1`;
    let imageBase = 'https://image.tmdb.org/t/p/w500';
    try {
        let response = await fetch(newMovies);
        let data = await response.json();
        displayMovies(data.results.slice(0, 10));
    } catch (error) {
        console.error('Error fetching newest movies:', error);
    }
}

function displayMovies(movies) {
    let moviesContainer = document.getElementById('movies-container');
    moviesContainer.innerHTML = '';

    movies.forEach(movie => {
        let movieCard = createMovieCard(movie);
        moviesContainer.appendChild(movieCard);
    });
}

function createMovieCard(movie) {
    let card = document.createElement('div');
    card.className = 'movie-card';

    let img = document.createElement('img');
    img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    img.alt = `${movie.title} poster`;

    let title = document.createElement('a');
    title.textContent = movie.title;
    title.href = `movie.html?id=${movie.id}`;
    title.className = 'movie-title';

    let releaseDate = document.createElement('p');
    releaseDate.textContent = `Release Date: ${movie.release_date}`;

    let overview = document.createElement('p');
    overview.textContent = movie.overview;

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(releaseDate);
    card.appendChild(overview);

    return card;
}