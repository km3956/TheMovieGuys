document.addEventListener("DOMContentLoaded", () => {
  fetchConfig().then((config) => {
    let urlParams = new URLSearchParams(window.location.search);
    let movieId = urlParams.get("id");
    if (movieId) {
      fetchMovieDetails(config, movieId);
    } else {
      console.error("No movie ID found in URL");
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

async function fetchMovieDetails(config, movieID) {
  let { api_url, api_read_token } = config;
  let movieDetails = `${api_url}movie/${movieID}?&language=en-US`;
  let movieProvider = `${api_url}movie/${movieID}/watch/providers?`;
  let castDetail = `https://api.themoviedb.org/3/movie/${movieID}/credits?&language=en-US`;

  try {
    let response = await fetch(movieDetails, {
      headers: {
        Authorization: `Bearer ${api_read_token}`,
      },
    });
    let provider = await fetch(movieProvider, {
      headers: {
        Authorization: `Bearer ${api_read_token}`,
      },
    });
    let cast = await fetch(castDetail, {
      headers: {
        Authorization: `Bearer ${api_read_token}`,
      },
    });
    let reviewsResponse = await fetch(`/movie?id=${movieID}`, {
      headers: {
        Authorization: `Bearer ${api_read_token}`,
      },
    });
    let data = await response.json();
    let providerData = await provider.json();
    let castData = await cast.json();
    let reviewsData = await reviewsResponse.json();
    createMovieDetails(data, providerData, castData, reviewsData);
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
  moviesContainer.innerHTML = "";

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
  overview.textContent = `Overview: ${movie.overview}`;

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
