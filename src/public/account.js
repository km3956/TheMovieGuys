document.addEventListener("DOMContentLoaded", async () => {
  let loginResult = await checkLogin();
  if (loginResult.ok) {
    fetchUserInfo();
    fetchFollowers();
    fetchFollowing();
    fetchLikedMovies();
    fetchLikedShows();

    let searchFriendsBtn = document.getElementById("searchFriendsBtn");
    searchFriendsBtn.addEventListener("click", () => {
      let input = document.getElementById("searchFriendsInput");
      fetchSearchFriends(input.value);
    });
  } else {
    // alert the user to login
    let statusDiv = document.getElementById("status");
    let p = document.createElement("p");
    p.textContent = "Please login to view your account!";
    p.classList.add(
      "p-3",
      "text-primary-emphasis",
      "bg-danger-subtle",
      "border",
      "border-danger-subtle",
      "rounded-3",
    );
    statusDiv.append(p);

    document.getElementById("user-content").style.display = "none";
    document.getElementById("movie-container").style.display = "none";
    document.getElementById("tv-container").style.display = "none";
  }
});

async function checkLogin() {
  let response = await fetch("/check-login", {
    method: "GET",
    credentials: "include",
  });

  return response;
}

async function fetchUserInfo() {
  let result = await fetch("/get-user");
  let data = await result.json();
  displayUserInfo(data);

  async function displayUserInfo(data) {
    let welcomeName = document.getElementById("welcome-name");
    welcomeName.textContent = `Welcome ${data.username}`;

    let usernameData = document.getElementById("user-name");
    usernameData.textContent = data.username;
  }
}

async function fetchFollowers() {
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
      let userLink = document.createElement("a");
      userLink.href = `/user/${user.username}`;
      userLink.textContent = user.username;

      newItem.appendChild(userLink);
      followerList.append(newItem);
    }
  }
}

async function fetchFollowing() {
  let result = await fetch("/get-following");
  let data = await result.json();
  displayFollowers(data);
  fetchFriendsLikedShows(data);

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
      let userLink = document.createElement("a");
      userLink.href = `/user/${user.username}`;
      userLink.textContent = user.username;

      newItem.appendChild(userLink);
      followingList.append(newItem);
    }
  }
}

async function fetchLikedMovies() {
  let result = await fetch("/get-liked-movies");
  let movies = await result.json();

  let movieCount = document.getElementById("movie-count");
  movieCount.textContent = `${movies.length} liked movies`;

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

    let movieData = await fetchMovieDetail(movies[index].movie_id);
    let card = createCard(movieData);
    carouselInner.lastChild.firstChild.appendChild(card);
  }
}

async function fetchMovieDetail(movie_id) {
  try {
    let response = await fetch(
      `/api/movie-details?id=${encodeURIComponent(movie_id)}`,
    );
    let data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching requested movie:", error);
  }
}

async function fetchLikedShows() {
  let result = await fetch("/get-liked-shows");
  let shows = await result.json();

  let showCount = document.getElementById("show-count");
  showCount.textContent = `${shows.length} liked tv shows`;

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

    let showData = await fetchShowDetail(shows[index].tv_id);
    let card = createCard(showData);
    carouselInner.lastChild.firstChild.appendChild(card);
  }
}

async function fetchShowDetail(tv_id) {
  try {
    let response = await fetch(
      `/api/tv-details?id=${encodeURIComponent(tv_id)}`,
    );
    let data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching requested show:", error);
  }
}

async function fetchFriendsLikedShows(data) {
  let following = data.following;
  let movieCounts = {};
  for (let user of following) {
    let userId = user.following_id;
    let movieResponse = await fetch(
      `/get-liked-movies-by-id?username=${userId}`,
      {
        method: "GET",
      },
    );

    let userLikedMovies = await movieResponse.json();

    userLikedMovies.forEach((movie) => {
      if (movieCounts[movie.movie_id]) {
        movieCounts[movie.movie_id].count += 1;
      } else {
        movieCounts[movie.movie_id] = { movie_id: movie.movie_id, count: 1 };
      }
    });

    let tvResponse = await fetch(`/get-liked-shows-by-id?username=${userId}`, {
      method: "GET",
    });

    let userLikedShows = await tvResponse.json();

    userLikedShows.forEach((show) => {
      if (movieCounts[show.tv_id]) {
        movieCounts[show.tv_id].count += 1;
      } else {
        movieCounts[show.tv_id] = { tv_id: show.tv_id, count: 1 };
      }
    });
  }

  let movieList = Object.values(movieCounts);

  movieList.sort((a, b) => b.count - a.count);
  movieList = movieList.slice(0, 5);

  const cardsPerSlide = 5;
  let carouselInner = document.getElementById("friends-liked");

  let header = document.getElementById("friends-liked-title");
  if (data.followingCount > 0) {
    header.innerHTML = "What Your Friends Liked:";
  }

  let carouselItem = document.createElement("div");
  carouselItem.className = "carousel-item active";
  carouselInner.appendChild(carouselItem);

  let childRow = document.createElement("div");
  childRow.className = "row";
  carouselItem.appendChild(childRow);

  for (let media of movieList) {
    let card;
    if (media.movie_id != null) {
      let details = await fetchMovieDetail(media.movie_id);
      card = createCard(details);
    } else {
      let details = await fetchShowDetail(media.tv_id);
      card = createCard(details);
    }

    carouselInner.lastChild.firstChild.appendChild(card);
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

async function fetchSearchFriends(input) {
  let parent = document.getElementById("searchResults");
  let error = false;
  let errorMsg = document.getElementById("errormessage");

  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }

  if (input.length != 0) {
    let response = await fetch(`/get-user-search/${input}`);
    let searchResults = await response.json();

    let friendsResult = await fetch("/get-following");
    let currentFriends = (await friendsResult.json()).following;

    let currentUser = await fetch("/get-user-id");
    let currentUserId = (await currentUser.json()).id;

    let followingIds = [];
    for (let i = 0; i < currentFriends.length; i++) {
      followingIds.push(currentFriends[i].following_id);
    }
    followingIds.push(currentUserId);

    let result = [];

    for (let j = 0; j < searchResults.length; j++) {
      let userId = searchResults[j].id;
      if (!followingIds.includes(userId)) {
        result.push(searchResults[j]);
      }
    }

    if (result.length != 0) {
      if (errorMsg) {
        errorMsg.remove();
      }

      for (let user of result) {
        let newItem = document.createElement("li");
        let username = document.createElement("span");
        let addButton = document.createElement("button");

        newItem.className =
          "list-group-item d-flex justify-content-between align-items-center";
        username.textContent = user.username;

        addButton.textContent = "+";
        addButton.className = "btn btn-success btn-sm";
        addButton.setAttribute("data-id", user.id);
        addButton.onclick = async function () {
          addButton.textContent = "☑️";
          this.disabled = true;

          let reviewResponse = await fetch("/add-friend", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              followingId: user.id,
            }),
          });
          if (reviewResponse.ok) {
            alert("Friend added!");
          } else {
            alert("Error adding friend! Please try again later.");
          }
        };

        newItem.appendChild(username);
        newItem.appendChild(addButton);
        parent.append(newItem);
      }
    } else {
      error = true;
    }
  } else {
    error = true;
  }

  if (error) {
    let statusDiv = document.getElementById("status");

    if (!errorMsg) {
      let p = document.createElement("p");
      p.textContent = "No Results!";
      p.setAttribute("id", "errormessage");
      p.classList.add(
        "p-3",
        "text-primary-emphasis",
        "bg-danger-subtle",
        "border",
        "border-danger-subtle",
        "rounded-3",
      );
      statusDiv.append(p);
    }
  }
}
