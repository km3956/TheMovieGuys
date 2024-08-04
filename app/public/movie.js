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

    let buttonRow = document.createElement('div');
    buttonRow.className = 'button-row';

    let title = document.createElement('h1');
    title.textContent = movie.title;
    title.className = 'movie-title';

    let controls = document.createElement('div');
    controls.className = 'controls';

    let dropdown = document.createElement("select");
    dropdown.appendChild(new Option("Choose", "Choose"));
    dropdown.appendChild(new Option("Currently Watching", "Currently Watching"));
    dropdown.appendChild(new Option("Add To Queue", "Add To Queue"));
    dropdown.appendChild(new Option("Already Watched", "Already Watched"));
    dropdown.className = "dropdown";

    let rateButton = document.createElement("button");
    rateButton.textContent = "Rate";
    rateButton.className = "rate-button";

    controls.appendChild(dropdown);
    controls.appendChild(rateButton);

    buttonRow.appendChild(controls);

    let detailsRow = document.createElement('div');
    detailsRow.className = 'details-row';

    let img = document.createElement('img');
    img.className = "movie-poster";
    img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    img.alt = `${movie.title} poster`;

    let info = document.createElement('div');
    info.className = 'movie-info';

    let releaseDate = document.createElement('p');
    releaseDate.textContent = `Release Date: ${movie.release_date}`;

    let runtime = document.createElement('p');
    runtime.textContent = `Runtime: ${movie.runtime} minutes`;

    let genres = document.createElement('p');
    genres.textContent = 'Genres: ' + movie.genres.map(genre => genre.name).join(', ');

    let overview = document.createElement('p');
    overview.textContent = movie.overview;
    `Overview: ${movie.runtime} minutes`;

    info.appendChild(releaseDate);
    info.appendChild(runtime);
    info.appendChild(genres);
    info.appendChild(overview);

    detailsRow.appendChild(img);
    detailsRow.appendChild(info);

    moviesContainer.appendChild(title);
    moviesContainer.appendChild(buttonRow);
    moviesContainer.appendChild(detailsRow);
}

