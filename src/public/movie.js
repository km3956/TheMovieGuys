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
    let movieProvider = `${api_url}movie/${movieID}/watch/providers?api_key=${api_key}`;
    let castDetail = `https://api.themoviedb.org/3/movie/${movieID}/credits?api_key=${api_key}&language=en-US`;

    try {
        let response = await fetch(movieDetails);
        let provider = await fetch(movieProvider);
        let data = await response.json();
        let providerData = await provider.json();
        let cast = await fetch(castDetail);   
        let castData = await cast.json();
        let reviewsResponse = await fetch(`/movie?id=${movieID}`);
        let reviewsData = await reviewsResponse.json();
        createMovieDetails(data, providerData, castData, reviewsData);
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}


function createMovieDetails(movie, providerData, castData, reviewsData) {
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
    overview.textContent = `Overview: ${movie.overview} minutes`;

    info.appendChild(releaseDate);
    info.appendChild(runtime);
    info.appendChild(genres);
    info.appendChild(overview);

    //Using US right now because that is the only country we are supporting
    let watchOptions = [];

    if (providerData.results && providerData.results.US) {

        if (providerData.results.US.flatrate && providerData.results.US.flatrate.length !== 0) {
            let flatrateOptions = providerData.results.US.flatrate.map(logo => ({
                path: logo.logo_path,
                name: logo.provider_name
            }));
            watchOptions = watchOptions.concat(flatrateOptions);
        }

        if (providerData.results.US.buy && providerData.results.US.buy.length !== 0) {
            let buyOptions = providerData.results.US.buy.map(logo => ({
                path: logo.logo_path,
                name: logo.provider_name
            }));
            watchOptions = watchOptions.concat(buyOptions);
        }
    }

    if (watchOptions.length !== 0) {
        let watch = document.createElement('p');
        watch.textContent = "Options to Watch: ";
        for (let i = 0; i < watchOptions.length; i++) {
            let img1 = document.createElement('img');
            img1.className = "provider-logo";
            img1.src = `https://image.tmdb.org/t/p/w45${watchOptions[i].path}`;
            img1.alt = watchOptions[i].name;
            watch.appendChild(img1);
        }
        info.appendChild(watch);
    }
        

    detailsRow.appendChild(img);
    detailsRow.appendChild(info);

    if (castData.cast && castData.cast.length !== 0) {
        let castSection = document.createElement('div');
        castSection.className = 'cast-section';

        let castTitle = document.createElement('p');
        castTitle.textContent = "Cast: ";
        castSection.appendChild(castTitle);

        let castRow = document.createElement('div');
        castRow.className = 'cast-row';

        let baseURL = "https://image.tmdb.org/t/p/w185";
        castData.cast.forEach(castMember => {
            if (castMember.profile_path) {
                let castImg = document.createElement('img');
                castImg.className = "cast-image";
                castImg.src = `${baseURL}${castMember.profile_path}`;
                castImg.alt = castMember.name;

                let castName = document.createElement('p');
                castName.textContent = castMember.name;
                castName.className = 'cast-name';

                let castCharacter = document.createElement('p');
                castCharacter.textContent = castMember.character;
                castCharacter.className = 'cast-character';

                let castItem = document.createElement('div');
                castItem.className = 'cast-item';
                castItem.appendChild(castImg);
                castItem.appendChild(castName);
                castItem.appendChild(castCharacter);

                castRow.appendChild(castItem);
            }
        });

        castSection.appendChild(castRow);
        info.appendChild(castSection);
    }

    moviesContainer.appendChild(title);
    moviesContainer.appendChild(buttonRow);
    moviesContainer.appendChild(detailsRow);

    if (reviewsData && reviewsData.length !== 0) {
        let reviewsSection = document.createElement('div');
        reviewsSection.className = 'reviews-section';

        let reviewsTitle = document.createElement('h2');
        reviewsTitle.textContent = "Reviews";
        reviewsSection.appendChild(reviewsTitle);

        reviewsData.forEach(review => {
            let reviewContainer = document.createElement('div');
            reviewContainer.className = 'review';

            let reviewer = document.createElement('p');
            reviewer.textContent = `Reviewer: ${review.author}`;
            reviewer.className = 'reviewer';

            let rating = document.createElement('p');
            rating.textContent = `Rating: ${review.rating}`;
            rating.className = 'review-rating';

            let content = document.createElement('p');
            content.textContent = review.comment;
            content.className = 'review-content';

            reviewContainer.appendChild(reviewer);
            reviewContainer.appendChild(rating);
            reviewContainer.appendChild(content);

            reviewsSection.appendChild(reviewContainer);
        });

        moviesContainer.appendChild(reviewsSection);
    }
    
}


