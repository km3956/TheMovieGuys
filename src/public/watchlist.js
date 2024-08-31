document.addEventListener("DOMContentLoaded", () => {
  fetchWatchedContent();
});

async function fetchWatchedContent() {
  let response = await fetch("/check-login", {
    method: "GET",
    credentials: "include",
  });

  if (response.ok) {
    let result = await fetch("/load_watched_list", {
      method: "GET",
    });

    let data = await result.json();

    displayWatchlists(data);
  } else {
    let statusDiv = document.getElementById("status");
    let p = document.createElement("p");
    p.textContent = "Please login to view watchlists!";
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

  async function displayWatchlists(data) {
    let content = document.getElementById("watchlist-content");

    const watching = [];
    const watched = [];
    const queue = [];

    for (let item of data["details"]) {
      if (item.status === "Watching") {
        watching.push(item);
      } else if (item.status === "Watched") {
        watched.push(item);
      } else if (item.status === "Queue") {
        queue.push(item);
      }
    }

    let watchingDOM = await createWatchListRow(watching, "Currently Watching");
    let queueDOM = await createWatchListRow(queue, "In Queue");
    let watchedDOM = await createWatchListRow(watched, "Watch History");

    content.append(watchingDOM);
    content.append(queueDOM);
    content.append(watchedDOM);
  }

  async function createWatchListRow(watchlist, header) {
    if (watchlist.length != 0) {
      let parent = document.createElement("div");
      let title = document.createElement("h3");
      let row = document.createElement("div");

      title.textContent = header;
      row.classList.add("row");

      for (let media of watchlist) {
        let card;
        if (media.movie_id != null) {
          let details = await fetchMovieDetail(media.movie_id);
          card = createCard(details);
        } else {
          let details = await fetchTVDetail(media.tv_id);
          card = createCard(details);
        }
        row.append(card);
      }

      parent.append(title);
      parent.append(row);
      return parent;
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
      console.error("Error fetching movie details:", error);
    }
  }

  async function fetchTVDetail(tv_id) {
    try {
      console.log(tv_id);
      let response = await fetch(
        `/api/tv-details?id=${encodeURIComponent(tv_id)}`,
      );
      let data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching tv show details:", error);
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
}
