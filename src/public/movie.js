document.addEventListener("DOMContentLoaded", () => {
  let urlParams = new URLSearchParams(window.location.search);
  let movieId = urlParams.get("id");
  if (movieId) {
    fetchMovieDetails(movieId);
  } else {
    console.error("No movie ID found in URL");
  }
});

async function fetchMovieDetails(movie_id) {
  try {
    let response = await fetch(
      `/api/movie-details?id=${encodeURIComponent(movie_id)}`,
    );
    let provider = await fetch(
      `/api/movie-provider?id=${encodeURIComponent(movie_id)}`,
    );
    let cast = await fetch(
      `/api/movie-cast?id=${encodeURIComponent(movie_id)}`,
    );
    let reviewsResponse = await fetch(`/movie?id=${movie_id}`);
    let data = await response.json();
    let providerData = await provider.json();
    let castData = await cast.json();
    let reviewsData = await reviewsResponse.json();
    createMovieDetails(data, providerData, castData, reviewsData);
    createLikeButton(data.id);
  } catch (error) {
    console.error("Error fetching movie details:", error);
  }
}

function createCastCard(castMember) {
  let card = document.createElement("div");
  card.className = "card card-media col-4 rounded";

  let cardImgDiv = document.createElement("div");
  cardImgDiv.className = "card-img-div";

  let img = document.createElement("img");
  img.className = "card-img";
  if (castMember.profile_path) {
    img.src = `https://image.tmdb.org/t/p/w185${castMember.profile_path}`;
  } else {
    img.src = "./images/empty-cast.webp";
  }

  img.alt = `${castMember.name}`;

  let cardText = document.createElement("div");
  cardText.className = "card-text";

  let castName = document.createElement("p");
  castName.textContent = castMember.name;
  castName.className = "cast-name";

  let castCharacter = document.createElement("p");
  castCharacter.textContent = castMember.character;
  castCharacter.className = "cast-character";

  cardText.appendChild(castName);
  cardText.appendChild(castCharacter);

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
  button.setAttribute("data-bs-target", "#" + id);
  button.setAttribute("data-bs-slide", direction);

  icon.className = `carousel-control-${direction}-icon`;
  icon.setAttribute("aria-hidden", "true");

  text.className = "visually-hidden";
  text.textContent = direction === "prev" ? "Previous" : "Next";

  button.appendChild(icon);
  button.appendChild(text);

  return button;
}

function createStarRating(rating) {
  let starContainer = document.createElement("div");
  starContainer.className = "star-rating";

  let fullStars = Math.floor(rating);
  let emptyStars = 5 - fullStars;

  for (let i = 0; i < fullStars; i++) {
    let star = document.createElement("img");
    star.src = "./images/full-star.png";
    star.alt = "Full Star";
    star.className = "star";
    starContainer.appendChild(star);
  }

  for (let i = 0; i < emptyStars; i++) {
    let star = document.createElement("img");
    star.src = "./images/empty-star.png";
    star.alt = "Empty Star";
    star.className = "star";
    starContainer.appendChild(star);
  }

  return starContainer;
}

function showRatingForm(movieId) {
  let modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "modal-movie";

  let modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.id = "modal-content-movie";

  let closeButton = document.createElement("span");
  closeButton.className = "close-button";
  closeButton.textContent = "x";

  let header = document.createElement("h2");
  header.textContent = "Rate this Movie";

  let ratingLabel = document.createElement("label");
  ratingLabel.setAttribute("for", "rating");
  ratingLabel.textContent = "Rating (1-5 stars):";

  let ratingInput = document.createElement("input");
  ratingInput.type = "number";
  ratingInput.id = "rating";
  ratingInput.name = "rating";
  ratingInput.min = "1";
  ratingInput.max = "5";
  ratingInput.required = true;

  let commentLabel = document.createElement("label");
  commentLabel.setAttribute("for", "comment");
  commentLabel.textContent = "Comment:";

  let commentTextarea = document.createElement("textarea");
  commentTextarea.id = "comment";
  commentTextarea.name = "comment";
  commentTextarea.required = true;

  let submitButton = document.createElement("button");
  submitButton.id = "submit-review";
  submitButton.textContent = "Submit";

  modalContent.appendChild(closeButton);
  modalContent.appendChild(header);
  modalContent.appendChild(ratingLabel);
  modalContent.appendChild(ratingInput);
  modalContent.appendChild(commentLabel);
  modalContent.appendChild(commentTextarea);
  modalContent.appendChild(submitButton);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  submitButton.addEventListener("click", async () => {
    let rating = ratingInput.value;
    let comment = commentTextarea.value;

    if (rating < 1 || rating > 5) {
      alert("Please enter a rating between 1 and 5.");
      return;
    }

    let response = await fetch("/check-login", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      let reviewResponse = await fetch("/submit-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: rating,
          comment: comment,
          movieId: movieId,
        }),
      });

      if (reviewResponse.ok) {
        alert("Review submitted successfully!");
        modal.remove();
        window.location.reload();
      } else if (reviewResponse.status === 409) {
        alert("You have already reviewed this movie.");
      } else {
        alert("Error submitting review. Please try again later.");
      }
    } else {
      alert("You need to log in to rate this movie.");
    }
  });

  closeButton.addEventListener("click", () => {
    console.log("Close button clicked");
    modal.remove();
  });
}

function createMovieDetails(movie, providerData, castData, reviewsData) {
  let moviesContainer = document.getElementById("movie-details");
  moviesContainer.textContent = "";

  let buttonRow = document.createElement("div");
  buttonRow.className = "button-row";

  let title = document.createElement("h1");
  title.textContent = movie.title;
  title.className = "movie-title";

  let controls = document.createElement("div");
  controls.id = "controls";

  let dropdown = document.createElement("select");
  dropdown.appendChild(new Option("Choose Status...", "Choose"));
  dropdown.appendChild(new Option("Currently Watching", "Watching"));
  dropdown.appendChild(new Option("Add To Queue", "Queue"));
  dropdown.appendChild(new Option("Already Watched", "Watched"));
  dropdown.id = "dropdown";

  let rateButton = document.createElement("button");
  rateButton.textContent = "Rate";
  rateButton.id = "rate-button";

  controls.appendChild(dropdown);
  controls.appendChild(rateButton);

  rateButton.addEventListener("click", () => {
    showRatingForm(movie.id);
  });

  dropdown.addEventListener("change", async (event) => {
    let selectedOption = event.target.value;
    console.log(selectedOption);
    let response = await fetch("/check-login", {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      if (selectedOption !== "Choose") {
        let reviewResponse = await fetch("/submit-queue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: selectedOption,
            movieId: movie.id,
          }),
        });
        if (reviewResponse.ok) {
          alert("Queue submitted successfully!");
        } else {
          alert("Error submitting queue. Please try again later.");
        }
      } else {
        alert("You need to log in to Queue this movie.");
      }
    }
  });

  buttonRow.appendChild(controls);

  let detailsRow = document.createElement("div");
  detailsRow.className = "details-row";

  let img = document.createElement("img");
  img.className = "movie-poster";
  img.src = `https://image.tmdb.org/t/p/w342${movie.poster_path}`;
  img.alt = `${movie.title} poster`;

  if (movie.backdrop_path) {
    detailsRow.style.backgroundImage = `url(https://image.tmdb.org/t/p/w500${movie.backdrop_path})`;
  }

  let info = document.createElement("div");
  info.className = "movie-info";

  let releaseDate = document.createElement("p");
  let inputDate = movie.release_date;
  if (inputDate) {
    let dateParts = inputDate.split("-");
    let formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
    releaseDate.textContent = `Release Date: ${formattedDate}`;
  }

  let runtime = document.createElement("p");
  runtime.textContent = `Runtime: ${movie.runtime} minutes`;

  let genres = document.createElement("p");
  genres.textContent =
    "Genres: " + movie.genres.map((genre) => genre.name).join(", ");

  let overview = document.createElement("p");
  if (movie.overview === "") {
    overview.textContent = `Overview: No overview available.`;
  } else {
    overview.textContent = `Overview: ${movie.overview}`;
  }

  info.appendChild(releaseDate);
  info.appendChild(runtime);
  info.appendChild(genres);
  info.appendChild(overview);

  //Using US right now because that is the only country we are supporting
  let watchOptions = [];

  if (providerData.results && providerData.results.US) {
    if (
      providerData.results.US.flatrate &&
      providerData.results.US.flatrate.length !== 0
    ) {
      let flatrateOptions = providerData.results.US.flatrate.map((logo) => ({
        path: logo.logo_path,
        name: logo.provider_name,
      }));
      watchOptions = watchOptions.concat(flatrateOptions);
    }

    if (
      providerData.results.US.buy &&
      providerData.results.US.buy.length !== 0
    ) {
      let buyOptions = providerData.results.US.buy.map((logo) => ({
        path: logo.logo_path,
        name: logo.provider_name,
      }));
      watchOptions = watchOptions.concat(buyOptions);
    }
  }

  if (watchOptions.length !== 0) {
    let watch = document.createElement("p");
    watch.textContent = "Options to Watch: ";
    for (let i = 0; i < watchOptions.length; i++) {
      let img1 = document.createElement("img");
      img1.className = "provider-logo";
      img1.src = `https://image.tmdb.org/t/p/w45${watchOptions[i].path}`;
      img1.alt = watchOptions[i].name;
      watch.appendChild(img1);
    }
    info.appendChild(watch);
  }

  detailsRow.appendChild(img);
  detailsRow.appendChild(info);
  moviesContainer.appendChild(title);
  moviesContainer.appendChild(buttonRow);
  moviesContainer.appendChild(detailsRow);

  if (castData.cast && castData.cast.length !== 0) {
    let castSection = document.createElement("div");
    castSection.className = "cast-section";

    let castTitle = document.createElement("h2");
    castTitle.textContent = "Cast";
    castSection.appendChild(castTitle);

    let carouselOuter = document.createElement("div");
    let carouselInner = document.createElement("div");
    let carouselID = "castCarousel";

    carouselOuter.className = "carousel carousel-light slide";
    carouselOuter.setAttribute("id", carouselID);
    carouselOuter.setAttribute("data-bs-interval", "false");
    carouselInner.className = "carousel-inner";

    let cardsPerSlide = 5;
    castData.cast.forEach((castMember, index) => {
      if (index % cardsPerSlide === 0) {
        let carouselItem = document.createElement("div");
        if (index === 0) {
          carouselItem.className = "carousel-item active";
        } else {
          carouselItem.className = "carousel-item";
        }
        carouselInner.appendChild(carouselItem);
        let childRow = document.createElement("div");
        childRow.className = "row";
        carouselItem.appendChild(childRow);
      }

      let castItem = createCastCard(castMember);
      carouselInner.lastChild.firstChild.appendChild(castItem);
    });

    carouselOuter.appendChild(carouselInner);

    let carouselPrev = createCarouselNav("prev", carouselID);
    let carouselNext = createCarouselNav("next", carouselID);

    carouselOuter.appendChild(carouselPrev);
    carouselOuter.appendChild(carouselNext);

    castSection.appendChild(carouselOuter);
    moviesContainer.appendChild(castSection);
  }

  if (reviewsData && reviewsData.length !== 0) {
    let reviewsSection = document.createElement("section");
    reviewsSection.className = "reviews-section";

    let reviewsTitle = document.createElement("h2");
    reviewsTitle.textContent = "Reviews";
    reviewsSection.appendChild(reviewsTitle);

    reviewsData.forEach((review) => {
      let reviewCard = document.createElement("article");
      reviewCard.className = "review-card";

      let reviewer = document.createElement("h3");
      reviewer.className = "review-author";
      let reviewerLink = document.createElement("a");
      reviewerLink.textContent = review.author;
      reviewerLink.href = `/user/${review.author}`;
      reviewer.appendChild(reviewerLink);

      let ratingContainer = createStarRating(review.rating);
      ratingContainer.className = "review-rating";

      let content = document.createElement("p");
      content.textContent = review.comment;
      content.className = "review-content";

      reviewCard.appendChild(reviewer);
      reviewCard.appendChild(ratingContainer);
      reviewCard.appendChild(content);

      reviewsSection.appendChild(reviewCard);
    });

    moviesContainer.appendChild(reviewsSection);
  }
}

async function createLikeButton(movie_id) {
  let controls = document.getElementById("controls");
  let likeButton = document.createElement("button");
  likeButton.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/></svg>';
  likeButton.classList.add("btn", "btn-outline-danger", "p-2", "m-2");
  likeButton.setAttribute("id", "like-button");
  likeButton.setAttribute("title", "Like");

  try {
    let response = await fetch("/check-login", {
      method: "GET",
      credentials: "include",
    });

    if (response.status == 200) {
      let data = await fetch(`/like-status/${movie_id}`);
      let status = await data.json();
      let liked = status.length != 0;

      if (liked) {
        updateButtonToLiked(likeButton);
      } else {
        updateButtonToUnliked(likeButton);
      }

      likeButton.addEventListener("click", async () => {
        if (liked) {
          unlike(movie_id);
          liked = false;
          updateButtonToUnliked(likeButton);
        } else {
          like(movie_id);
          liked = true;
          updateButtonToLiked(likeButton);
        }
      });
    } else if (response.status == 401) {
      likeButton.disabled = true;
    } else {
      console.log("Error occured!");
    }
  } catch (error) {
    console.error("Error checking login status");
  }

  controls.append(likeButton);
}

function updateButtonToLiked(button) {
  button.setAttribute("id", "liked-button");
  button.setAttribute("title", "Unlike");
  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/></svg>`;
  button.classList.remove("btn-outline-danger");
  button.classList.add("btn-danger");
}

function updateButtonToUnliked(button) {
  button.setAttribute("id", "unliked-button");
  button.setAttribute("title", "Like");
  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16"><path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/></svg>`;
  button.classList.remove("btn-danger");
  button.classList.add("btn-outline-danger");
}

async function like(movie_id) {
  let likeResponse = await fetch("/like-movie", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      movieID: movie_id,
    }),
  });
}

async function unlike(movie_id) {
  let unlikeResponse = await fetch("/unlike-movie", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      movieID: movie_id,
    }),
  });
}
