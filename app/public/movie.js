document.addEventListener('DOMContentLoaded', () => {
    fetchConfig().then(config => {
        let urlParams = new URLSearchParams(window.location.search);
        let movieId = urlParams.get('id');
        if (movieId) {
            fetchMovieDetails(config, movieId);
        } else {
            console.error('No movie ID found in URL');
        }
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

async function fetchMovieDetails(config, movieID) {
    let { api_url, api_key } = config;
    let movieDetails = `${api_url}movie/${movieID}?api_key=${api_key}&language=en-US`;
    try {
        let response = await fetch(movieDetails);
        let data = await response.json();
        createMovieDetails(data);
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}


function createMovieDetails(movie) {
    let moviesContainer = document.getElementById('movie-details');
    moviesContainer.innerHTML = '';
    
    let title = document.createElement('h1');
    title.textContent = movie.title;
    let img = document.createElement('img');
    img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    img.alt = `${movie.title} poster`;
    let releaseDate = document.createElement('p');
    releaseDate.textContent = `Release Date: ${movie.release_date}`;
    let overview = document.createElement('p');
    overview.textContent = movie.overview;
    moviesContainer.appendChild(title);
    moviesContainer.appendChild(img);
    moviesContainer.appendChild(releaseDate);
    moviesContainer.appendChild(overview);

}