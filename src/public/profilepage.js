document.addEventListener("DOMContentLoaded", () => {
  let username = window.location.pathname.split("/").pop();
  fetchUserProfile(username).then(() => {
    fetchConfig().then((config) => {
      fetchLikedMovies(config, username);
      fetchLikedShows(config, username);
      fetchQueue(config, username);
    });
  });
});

async function fetchUserProfile(username) {
  try {
    let response = await fetch(`/get-user/${username}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let userData = await response.json();

    document.getElementById("profile-username").textContent =
      `Profile: ${userData.username}`;
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
}

async function fetchConfig() {
  try {
    let response = await fetch("/env.json");
    let config = await response.json();
    return config;
  } catch (error) {
    console.error("Error loading configuration:", error);
  }
}

async function fetchLikedMovies(config, username) {
  try {
    let result = await fetch(`/get-user-liked-movies?username=${username}`);
    let movies = await result.json();

    if (movies.length === 0) {
      $("#movie-container").toggle();
    }

    const cardsPerSlide = 5;
    let carouselInner = document.getElementById("liked-movies");

    for (let index = 0; index < movies.length; index++) {
      if (index % cardsPerSlide === 0) {
        let carouselItem = document.createElement("div");
        carouselItem.className =
          index === 0 ? "carousel-item active" : "carousel-item";
        carouselInner.appendChild(carouselItem);

        let childRow = document.createElement("div");
        childRow.className = "row";
        carouselItem.appendChild(childRow);
      }

      let movieData = await fetchMovieDetail(config, movies[index].movie_id);
      let card = createCard(movieData);
      carouselInner.lastChild.firstChild.appendChild(card);
    }
  } catch (error) {
    console.error("Error fetching liked movies:", error);
  }
}

async function fetchLikedShows(config, username) {
  try {
    let result = await fetch(`/get-user-liked-shows?username=${username}`);
    let shows = await result.json();

    if (shows.length === 0) {
      $("#tv-container").toggle();
    }

    const cardsPerSlide = 5;
    let carouselInner = document.getElementById("liked-shows");

    for (let index = 0; index < shows.length; index++) {
      if (index % cardsPerSlide === 0) {
        let carouselItem = document.createElement("div");
        carouselItem.className =
          index === 0 ? "carousel-item active" : "carousel-item";
        carouselInner.appendChild(carouselItem);

        let childRow = document.createElement("div");
        childRow.className = "row";
        carouselItem.appendChild(childRow);
      }

      let showData = await fetchShowDetail(config, shows[index].tv_id);
      let card = createCard(showData);
      carouselInner.lastChild.firstChild.appendChild(card);
    }
  } catch (error) {
    console.error("Error fetching liked TV shows:", error);
  }
}

async function fetchQueue(config, username) {
  try {
    let result = await fetch(`/get-queue?username=${username}`);
    let queueItems = await result.json();

    if (queueItems.length === 0) {
      $("#queue-container").toggle();
    }

    const cardsPerSlide = 5;
    let carouselInner = document.getElementById("queue");

    for (let index = 0; index < queueItems.length; index++) {
      if (index % cardsPerSlide === 0) {
        let carouselItem = document.createElement("div");
        carouselItem.className =
          index === 0 ? "carousel-item active" : "carousel-item";
        carouselInner.appendChild(carouselItem);

        let childRow = document.createElement("div");
        childRow.className = "row";
        carouselItem.appendChild(childRow);
      }

      let itemData = queueItems[index];
      let card = await createQueueCard(config, itemData);
      carouselInner.lastChild.firstChild.appendChild(card);
    }
  } catch (error) {
    console.error("Error fetching queue items:", error);
  }
}

async function fetchMovieDetail(config, movie_id) {
  let { api_url, api_read_token } = config;
  let movie = `${api_url}movie/${movie_id}?language=en-US`;
  try {
    let response = await fetch(movie, {
      headers: {
        Authorization: `Bearer ${api_read_token}`,
      },
    });
    let data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
  }
}

async function fetchShowDetail(config, tv_id) {
  let { api_url, api_read_token } = config;
  let show = `${api_url}tv/${tv_id}?language=en-US`;
  try {
    let response = await fetch(show, {
      headers: {
        Authorization: `Bearer ${api_read_token}`,
      },
    });
    let data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching show details:", error);
  }
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
    title.href = `/movie.html?id=${result.id}`;
    title.className = "movie-title";
  } else {
    title.textContent = result.name;
    title.href = `/tv.html?id=${result.id}`;
    title.className = "tv-title";
  }

  let cardText = document.createElement("div");
  cardText.className = "card-text";

  let relevantDate = document.createElement("p");
  if (result.hasOwnProperty("release_date")) {
    relevantDate.textContent = `Release Date: ${result.release_date}`;
  } else {
    relevantDate.textContent = `First Air Date: ${result.first_air_date}`;
  }

  let overview = document.createElement("p");
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

async function createQueueCard(config, item) {
  if (item.movie_id) {
    let movieData = await fetchMovieDetail(config, item.movie_id);
    return createCard(movieData);
  } else {
    let showData = await fetchShowDetail(config, item.tv_id);
    return createCard(showData);
  }
}
