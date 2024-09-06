document.addEventListener("DOMContentLoaded", () => {
  let urlParams = new URLSearchParams(window.location.search);
  let tvID = urlParams.get("id");
  if (tvID) {
    fetchTVDetails(tvID);
  } else {
    console.error("No TV ID found in URL");
  }
});

async function fetchTVDetails(tv_id) {
  try {
    let response = await fetch(
      `/api/tv-details?id=${encodeURIComponent(tv_id)}`,
    );
    let provider = await fetch(
      `/api/tv-provider?id=${encodeURIComponent(tv_id)}`,
    );
    let cast = await fetch(`/api/tv-cast?id=${encodeURIComponent(tv_id)}`);
    let reviewsResponse = await fetch(`/tv?id=${tv_id}`);
    let data = await response.json();
    let providerData = await provider.json();
    let castData = await cast.json();
    let reviewsData = await reviewsResponse.json();
    createTVDetails(data, providerData, castData, reviewsData);
    createLikeButton(data.id);
  } catch (error) {
    console.error("Error fetching tv details:", error);
  }
}

function createCastCard(result) {
  let card = document.createElement("div");
  card.className = "card card-media col-4 rounded";

  let cardImgDiv = document.createElement("div");
  cardImgDiv.className = "card-img-div";

  let img = document.createElement("img");
  img.className = "card-img";

  img.src = `https://image.tmdb.org/t/p/w500${result.profile_path}`;
  img.alt = `${result.name} image`;
  img.onerror = () => {
    img.src = "images/NoImageAvailable.jpg";
  };

  let name = document.createElement("p");
  name.textContent = result.name;
  name.className = "person-name";

  let castCharacter = document.createElement("p");
  castCharacter.textContent = result.character;
  castCharacter.className = "cast-character";

  let cardText = document.createElement("div");
  cardText.className = "card-text";

  cardText.append(castCharacter);
  cardText.append(name);
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

function displayResults(results, containerId) {
  let cardContainer = document.getElementById(containerId);
  let carouselOuter = document.createElement("div");
  let carouselInner = document.createElement("div");
  let carouselID = "id" + Math.floor(10000 + Math.random() * 90000).toString();

  carouselOuter.className = "carousel carousel-light slide";
  carouselOuter.setAttribute("id", carouselID);
  carouselOuter.setAttribute("data-bs-interval", "false");
  carouselInner.className = "carousel-inner";

  const cardsPerSlide = 5;

  results.forEach((result, index) => {
    if (index % cardsPerSlide === 0) {
      let carouselItem = document.createElement("div");
      carouselItem.className =
        index === 0 ? "carousel-item active" : "carousel-item";
      carouselInner.appendChild(carouselItem);

      let childRow = document.createElement("div");
      childRow.className = "row";
      carouselItem.appendChild(childRow);
    }

    let card = createCastCard(result);
    carouselInner.lastChild.firstChild.appendChild(card);
  });

  carouselOuter.appendChild(carouselInner);

  let carouselPrev = createCarouselNav("prev", carouselID);
  let carouselNext = createCarouselNav("next", carouselID);

  carouselOuter.appendChild(carouselPrev);
  carouselOuter.appendChild(carouselNext);

  cardContainer.appendChild(carouselOuter);
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

function showRatingForm(tvId) {
  let modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "modal-show"

  let modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.id = "modal-content-show";

  let closeButton = document.createElement("span");
  closeButton.className = "close-button";
  closeButton.textContent = "×";

  let header = document.createElement("h2");
  header.textContent = "Rate this Show";

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
  console.log(tvId);

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
      let reviewResponse = await fetch("/submit-review-show", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: rating,
          comment: comment,
          tvId: tvId,
        }),
      });

      if (reviewResponse.ok) {
        alert("Review submitted successfully!");
        modal.remove();
        window.location.reload();
      } else if (reviewResponse.status === 409) {
        alert("You have already reviewed this show.");
      } else {
        alert("Error submitting review. Please try again later.");
      }
    } else {
      alert("You need to log in to rate this movie.");
    }
    // let rating = ratingInput.value;
    // let comment = commentTextarea.value;

    // let response = await fetch("/check-login", {
    //   method: "GET",
    //   credentials: "include",
    // });

    // if (response.ok) {
    //   console.log(tvId);
    //   let reviewResponse = await fetch("/submit-review", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       rating: rating,
    //       comment: comment,
    //       tvId: tvId,
    //     }),
    //   });

    //   if (reviewResponse.ok) {
    //     alert("Review submitted successfully!");
    //     modal.remove();
    //   } else {
    //     alert("Error submitting review. Please try again later.");
    //   }
    // } else {
    //   alert("You need to log in to rate this movie.");
    // }
  });

  closeButton.addEventListener("click", () => {
    console.log("Close button clicked");
    modal.remove();
  });
}

function createTVDetails(tv, providerData, castData, reviewsData) {
  let tvContainer = document.getElementById("tv-details");
  tvContainer.textContent = "";

  let buttonRow = document.createElement("div");
  buttonRow.className = "button-row";

  let title = document.createElement("h1");
  title.textContent = tv.name;
  title.className = "tv-title";

  let controls = document.createElement("div");
  controls.id = "controls";

  let dropdown = document.createElement("select");
  dropdown.appendChild(new Option("Choose", "Choose"));
  dropdown.appendChild(new Option("Currently Watching", "Currently Watching"));
  dropdown.appendChild(new Option("Add To Queue", "Add To Queue"));
  dropdown.appendChild(new Option("Already Watched", "Already Watched"));
  dropdown.id = "dropdown";

  let rateButton = document.createElement("button");
  rateButton.textContent = "Rate";
  rateButton.id = "rate-button";

  controls.appendChild(dropdown);
  controls.appendChild(rateButton);

  rateButton.addEventListener("click", () => {
    showRatingForm(tv.id);
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
            tvId: tv.id,
          }),
        });
        if (reviewResponse.ok) {
          alert("Queue submitted successfully!");
        } else {
          alert("Error submitting queue. Please try again later.");
        }
      } else {
        alert("You need to log in to Queue this show.");
      }
    }
  });

  buttonRow.appendChild(controls);

  let detailsRow = document.createElement("div");
  detailsRow.className = "details-row";

  let img = document.createElement("img");
  img.className = "tv-poster";
  img.src = `https://image.tmdb.org/t/p/w342${tv.poster_path}`;
  img.alt = `${tv.name} poster`;

  if (tv.backdrop_path) {
    detailsRow.style.backgroundImage = `url(https://image.tmdb.org/t/p/w500${tv.backdrop_path})`;
  }

  let info = document.createElement("div");
  info.className = "tv-info";

  let firstAirDate = document.createElement("p");
  let inputDate = tv.first_air_date;
  if (inputDate) {
    let dateParts = inputDate.split("-");
    let formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
    firstAirDate.textContent = `First Air Date: ${formattedDate}`;
  }

  let genres = document.createElement("p");
  genres.textContent =
    "Genres: " + tv.genres.map((genre) => genre.name).join(", ");

  let overview = document.createElement("p");
  if (tv.overview === "") {
    overview.textContent = `Overview: No overview available.`;
  } else {
    overview.textContent = `Overview: ${tv.overview}`;
  }

  info.appendChild(firstAirDate);
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
  tvContainer.appendChild(title);
  tvContainer.appendChild(buttonRow);
  tvContainer.appendChild(detailsRow);

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
    tvContainer.appendChild(castSection);
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

    tvContainer.appendChild(reviewsSection);
  }
}

async function createLikeButton(tv_id) {
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
      let data = await fetch(`/like-status-tv/${tv_id}`);
      let status = await data.json();
      let liked = status.length != 0;

      if (liked) {
        updateButtonToLiked(likeButton);
      } else {
        updateButtonToUnliked(likeButton);
      }

      likeButton.addEventListener("click", async () => {
        if (liked) {
          unlike(tv_id);
          liked = false;
          updateButtonToUnliked(likeButton);
        } else {
          like(tv_id);
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

async function like(tv_id) {
  let likeResponse = await fetch("/like-tv", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tvID: tv_id,
    }),
  });
}

async function unlike(tv_id) {
  let unlikeResponse = await fetch("/unlike-tv", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tvID: tv_id,
    }),
  });
}
