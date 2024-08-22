document.addEventListener("DOMContentLoaded", () => {
  fetchConfig().then((config) => {
    displayMovies(fetchMovies(config));
  });
});

let currentPage = 1;
let totalPages = 1;

async function fetchConfig() {
  try {
    let response = await fetch("env.json");
    let config = await response.json();
    return config;
  } catch (error) {
    console.error("Error loading configuration:", error);
  }
}

async function fetchMovies(config, page = 1) {
  let { api_url, api_read_token } = config;
  let upcomingMovies = `${api_url}movie/now_playing?language=en-US&page=${page}`;
  try {
    let response = await fetch(upcomingMovies, {
      headers: {
        Authorization: `Bearer ${api_read_token}`,
      },
    });
    let data = await response.json();
    totalPages = data.total_pages;
    displayMovies(data.results);
    displayPagination();
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}

function displayMovies(movies) {
  let moviesDiv = document.getElementById("movies-content");
  moviesDiv.textContent = "";
  moviesDiv.className = "d-flex justify-content-center flex-wrap";

  let moviesPerRow = 5;
  let rowDiv = null;

  movies.forEach((movie, index) => {
    if (index % moviesPerRow === 0) {
      rowDiv = document.createElement("div");
      rowDiv.className = "row mb-3";
      moviesDiv.appendChild(rowDiv);
    }
    let card = createCard(movie);
    rowDiv.appendChild(card);
  });
}

function createCard(result) {
  let card = document.createElement("div");
  card.className = "card card-media col-4 rounded";

  let cardImgDiv = document.createElement("div");
  cardImgDiv.className = "card-img-div";

  let img = document.createElement("img");
  img.className = "card-img";

  img.src = `https://image.tmdb.org/t/p/w500${result.poster_path}`;
  img.alt = `${result.title} poster`;

  let title = document.createElement("a");
  if (result.hasOwnProperty("title")) {
    title.textContent = result.title;
    title.href = `movie.html?id=${result.id}`;
    title.className = "movie-title";
  } else {
    title.textContent = result.name;
    title.href = `tv.html?id=${result.id}`;
    title.className = "tv-title";
  }

  let cardText = document.createElement("div");
  cardText.className = "card-text";

  let relevantDate = document.createElement("p");
  if (result.hasOwnProperty("release_date")) {
    let inputDate = result.release_date;
    if (inputDate) {
      let dateParts = inputDate.split("-");
      let formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
      relevantDate.textContent = `Release Date: ${formattedDate}`;
    }
  } else {
    let inputDate = result.first_air_date;
    if (inputDate) {
      let dateParts = inputDate.split("-");
      let formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
      relevantDate.textContent = `First Air Date: ${formattedDate}`;
    }
  }

  let overview = document.createElement("p");
  if (result.overview.length > 100) {
    var shortText = result.overview.substr(0, 120) + "...";
    overview.textContent = shortText;
  } else if (result.overview.length === 0) {
    overview.textContent = "No overview available.";
  }

  cardText.append(title);
  cardText.append(relevantDate);
  cardText.append(overview);

  cardImgDiv.appendChild(img);
  cardImgDiv.appendChild(cardText);

  card.appendChild(cardImgDiv);

  return card;
}
