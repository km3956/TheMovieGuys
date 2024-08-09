document.addEventListener('DOMContentLoaded', () => {
    fetchConfig().then(config => {
        fetchNewestMovies(config);
        fetchTopMovies(config);
        fetchUpcomingMovies(config);
        fetchTopShows(config);
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
    try {
        let response = await fetch(newMovies);
        let data = await response.json();
        displayResults(data.results, "new-movies-container");
    } catch (error) {
        console.error('Error fetching newest movies:', error);
    }
}

async function fetchTopMovies(config) {
    let { api_url, api_key } = config;
    let topMovies = `${api_url}movie/popular?api_key=${api_key}&language=en-US&page=1`;
    try {
        let response = await fetch(topMovies);
        let data = await response.json();
        displayResults(data.results, "top-movies-container");
    } catch (error) {
        console.error('Error fetching top movies:', error);
    }
}

async function fetchUpcomingMovies(config) {
    let { api_url, api_key } = config;
    let currentDate = new Date();
    let allMovies = [];
    let data = {};
    for (let i = 1; i <= 10; i++) {
        let upcomingMovies = `${api_url}movie/upcoming?api_key=${api_key}&language=en-US&page=${i}`;
        try {
            let response = await fetch(upcomingMovies);
            data = await response.json();
            allMovies = allMovies.concat(data.results);
        } catch (error) {
            console.error('Error fetching upcoming movies:', error);
        }
    }
    let upcomingMoviesFiltered = data.results.filter(movie => {
        let releaseDate = new Date(movie.release_date);
        return releaseDate > currentDate;
    });
    displayResults(upcomingMoviesFiltered, "upcoming-movies-container");
}

async function fetchTopShows(config) {
    let { api_url, api_key } = config;
    let topShows = `${api_url}tv/popular?api_key=${api_key}&language=en-US&page=1`;
    try {
        let response = await fetch(topShows);
        let data = await response.json();
        displayResults(data.results, "tv-shows-container");
    } catch (error) {
        console.error('Error fetching top shows:', error);
    }
}

function displayResults(results, containerId) {
    let cardContainer = document.getElementById(containerId);
    let carouselOuter = document.createElement("div");
    let carouselInner = document.createElement("div");
    let carouselID = "id" + (Math.floor(10000 + Math.random() * 90000)).toString();
    
    carouselOuter.className = "carousel carousel-light slide";
    carouselOuter.setAttribute("id", carouselID);
    carouselOuter.setAttribute("data-bs-interval", "false");
    carouselInner.className = "carousel-inner";

    const cardsPerSlide = 5;

    results.forEach((result, index) => {
        if (index % cardsPerSlide === 0) {
            let carouselItem = document.createElement("div");
            carouselItem.className = index===0 ? "carousel-item active" : "carousel-item";
            carouselInner.appendChild(carouselItem);

            let childRow = document.createElement("div");
            childRow.className = "row";
            carouselItem.appendChild(childRow);
        }

        let card = createCard(result);
        carouselInner.lastChild.firstChild.appendChild(card);
    });

    carouselOuter.appendChild(carouselInner);

    let carouselPrev = createCarouselNav("prev", carouselID);
    let carouselNext = createCarouselNav("next", carouselID);

    carouselOuter.appendChild(carouselPrev);
    carouselOuter.appendChild(carouselNext);

    cardContainer.appendChild(carouselOuter);    
}

function createCard(result) {
    let card = document.createElement('div');
    card.className = "card card-media col-4 rounded";

    let cardImgDiv = document.createElement('div');
    cardImgDiv.className = "card-img-div";

    let img = document.createElement('img');
    img.className = "card-img";

    img.src = `https://image.tmdb.org/t/p/w500${result.poster_path}`;
    img.alt = `${result.title} poster`;

    let title = document.createElement('a');
    if(result.hasOwnProperty("title")) {
        title.textContent = result.title;
        title.href = `movie.html?id=${result.id}`;
        title.className = 'movie-title';
    } else {
        title.textContent = result.name;
        title.href = `tv.html?id=${result.id}`;
        title.className = 'tv-title';
    }

    let cardText = document.createElement("div");
    cardText.className = "card-text";

    let relevantDate = document.createElement('p');
    if(result.hasOwnProperty("release_date")) {
        relevantDate.textContent = `Release Date: ${result.release_date}`;
    } else {
        relevantDate.textContent = `First Air Date: ${result.first_air_date}`;
    }

    let overview = document.createElement('p');
    if (result.overview.length > 100) {
        var shortText = result.overview.substr(0, 120) + "...";
        overview.textContent = shortText;
    }
    
    cardText.append(title);
    cardText.append(relevantDate);
    cardText.append(overview);

    cardImgDiv.appendChild(img);
    cardImgDiv.appendChild(cardText);

    card.appendChild(cardImgDiv);

    return card;
}

function createCarouselNav(direction, id) {
    let button = document.createElement("button");
    let icon = document.createElement("span");
    let text = document.createElement("span");
    
    button.className = `carousel-control-${direction}`;
    button.setAttribute("type", "button");
    button.setAttribute("data-bs-target", '#' + id);
    button.setAttribute("data-bs-slide", direction);
    
    icon.className = `carousel-control-${direction}-icon`;
    icon.setAttribute("aria-hidden", "true");
    
    text.className = "visually-hidden";
    text.textContent = direction === "prev" ? "Previous" : "Next";
    
    button.appendChild(icon);
    button.appendChild(text);
    
    return button;
    }