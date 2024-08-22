document.addEventListener("DOMContentLoaded", () => {
  fetchConfig().then((config) => {
    fetchMovies(config);
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
    displayPagination(config);
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

function displayPagination(config) {
  let paginationDiv = document.getElementById("pagination");
  paginationDiv.textContent = "";

  let pagesShown = 4;
  let startPage = Math.max(1, currentPage - Math.floor(pagesShown / 2));
  let endPage = Math.min(totalPages, startPage + pagesShown - 1);

  if (endPage - startPage < pagesShown - 1) {
    startPage = Math.max(1, endPage - pagesShown + 1);
  }

  let paginationList = document.createElement("ul");
  paginationList.classList.add("pagination", "justify-content-center");

  let prevItem = document.createElement("li");
  prevItem.classList.add("page-item");
  if (currentPage === 1) {
    prevItem.classList.add("disabled");
  }
  let prevButton = document.createElement("a");
  prevButton.classList.add("page-link");
  prevButton.textContent = "«";
  prevButton.setAttribute("href", "#");
  prevButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      fetchMovies(config, currentPage);
    }
  });
  prevItem.appendChild(prevButton);
  paginationList.appendChild(prevItem);

  for (let i = startPage; i <= endPage; i++) {
    let pageItem = document.createElement("li");
    pageItem.classList.add("page-item");
    if (i === currentPage) {
      pageItem.classList.add("active");
    }
    let pageButton = document.createElement("a");
    pageButton.classList.add("page-link");
    pageButton.textContent = i;
    pageButton.setAttribute("href", "#");
    pageButton.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      fetchMovies(config, currentPage);
    });
    pageItem.appendChild(pageButton);
    paginationList.appendChild(pageItem);
  }

  let nextItem = document.createElement("li");
  nextItem.classList.add("page-item");
  if (currentPage === totalPages) {
    nextItem.classList.add("disabled");
  }
  let nextButton = document.createElement("a");
  nextButton.classList.add("page-link");
  nextButton.textContent = "»";
  nextButton.setAttribute("href", "#");
  nextButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      fetchMovies(config, currentPage);
    }
  });
  nextItem.appendChild(nextButton);
  paginationList.appendChild(nextItem);

  paginationDiv.appendChild(paginationList);
}
