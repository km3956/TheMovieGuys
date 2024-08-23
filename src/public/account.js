document.addEventListener("DOMContentLoaded", () => {
    fetchConfig().then(async (config) => {
        let loginResult = await checkLogin();
        if (loginResult.ok) {
            fetchUserInfo(config);
            fetchFollowers(config);
            fetchFollowing(config);
            fetchLikedMovies(config);
            fetchLikedShows(config);
        } else {
            // redirect user to login page
            location.href = "./login.html";
        }
    });
});

async function fetchConfig() {
    try {
      let response = await fetch("env.json");
      let config = await response.json();
      return config;
    } catch (error) {
        console.error("Error loading configuration:", error);
    }
}

async function checkLogin() {
    let response = await fetch("/check-login", {
        method: "GET",
        credentials: "include",
    });

    return response;
}

async function fetchUserInfo(config) {
    let result = await fetch("/get-user");
    let data = await result.json();
    displayUserInfo(data);

    async function displayUserInfo(data) {
        let welcomeName = document.getElementById("welcome-name");
        welcomeName.textContent = `Welcome ${data.username}`;

        let usernameData = document.getElementById("user-name");
        usernameData.textContent = data.username;

        let displayNameData = document.getElementById("display-name");
        displayNameData.textContent = "{placeholder}";
    }
}

async function fetchFollowers(config) {
    let result = await fetch("/get-followers");
    let data = await result.json();
    displayFollowers(data);
   
    async function displayFollowers(data) {
        let followerButton = document.getElementById("followerButton");
        followerButton.textContent = `${data.followerCount} followers`;

        let followerList = document.getElementById("follower-list");
        let path, result, user;
        for (let i = 0; i < data.followerCount; i++) {
            path = "/get-user/" + data.followers[i].follower_id;
            result = await fetch(path);
            user = await result.json();
            
            let newItem = document.createElement("li");
            newItem.className = "list-group-item";
            newItem.textContent = user.username;
            followerList.append(newItem);
        }
    }
}

async function fetchFollowing(config) {
    let result = await fetch("/get-following");
    let data = await result.json();
    displayFollowers(data);
   
    async function displayFollowers(data) {
        let followingButton = document.getElementById("followingButton");
        followingButton.textContent = `${data.followingCount} following`;

        let followingList = document.getElementById("following-list");
        let path, result, user;
        for (let i = 0; i < data.followingCount; i++) {
            path = "/get-user/" + data.following[i].following_id;
            result = await fetch(path);
            user = await result.json();
            
            let newItem = document.createElement("li");
            newItem.className = "list-group-item";
            newItem.textContent = user.username;
            followingList.append(newItem);
        }
    }
}

async function fetchLikedMovies(config) {
    let result = await fetch("/get-liked-movies");
    let movies = await result.json();
    
    const cardsPerSlide = 5;
    let carouselInner = document.getElementById("liked-movies");
    movies.forEach(async (movie, index) => {
        if (index % cardsPerSlide === 0) {
            let carouselItem = document.createElement("div");
            carouselItem.className =
              index === 0 ? "carousel-item active" : "carousel-item";
            carouselInner.appendChild(carouselItem);
      
            let childRow = document.createElement("div");
            childRow.className = "row";
            carouselItem.appendChild(childRow);
          }
      
          let movieData = await fetchMovieDetail(config, movie.movie_id);
          let card = createCard(movieData);
          carouselInner.lastChild.firstChild.appendChild(card);
    });
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
      console.error("Error fetching requested movie:", error);
    }
}

async function fetchLikedShows(config) {
    let result = await fetch("/get-liked-shows");
    let shows = await result.json();
    
    const cardsPerSlide = 5;
    let carouselInner = document.getElementById("liked-shows");
    shows.forEach(async (show, index) => {
        if (index % cardsPerSlide === 0) {
            let carouselItem = document.createElement("div");
            carouselItem.className =
              index === 0 ? "carousel-item active" : "carousel-item";
            carouselInner.appendChild(carouselItem);
      
            let childRow = document.createElement("div");
            childRow.className = "row";
            carouselItem.appendChild(childRow);
          }
      
          let showData = await fetchShowDetail(config, show.tv_id);
          console.log(showData);
          let card = createCard(showData);
          carouselInner.lastChild.firstChild.appendChild(card);
    });
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
      console.error("Error fetching requested show:", error);
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