document.addEventListener("DOMContentLoaded", () => {
  fetchConfig().then((config) => {
    let urlParams = new URLSearchParams(window.location.search);
    let tvID = urlParams.get("id");
    if (tvID) {
      fetchTVDetails(config, tvID);
    } else {
      console.error("No TV ID found in URL");
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

async function fetchTVDetails(config, tvID) {
  let { api_url, api_read_token } = config;
  let tvDetails = `${api_url}tv/${tvID}?&language=en-US`;
  let tvProvider = `${api_url}tv/${tvID}/watch/providers?`;
  let castDetail = `https://api.themoviedb.org/3/tv/${tvID}/credits?&language=en-US`;

  try {
    let response = await fetch(tvDetails, {
      headers: {
        Authorization: `Bearer ${api_read_token}`,
      },
    });
    let provider = await fetch(tvProvider, {
      headers: {
        Authorization: `Bearer ${api_read_token}`,
      },
    });
    let cast = await fetch(castDetail, {
      headers: {
        Authorization: `Bearer ${api_read_token}`,
      },
    });
    let reviewsResponse = await fetch(`/tv?id=${tvID}`);
    let data = await response.json();
    let providerData = await provider.json();
    let castData = await cast.json();
    let reviewsData = await reviewsResponse.json();
    createTVDetails(data, providerData, castData, reviewsData);
  } catch (error) {
    console.error("Error fetching show details:", error);
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

  let name = document.createElement("a");
  name.textContent = result.name;
  name.href = `person.html?id=${result.id}`;
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

function createTVDetails(tv, providerData, castData, reviewsData) {
  let tvContainer = document.getElementById("tv-details");
  tvContainer.textContent = "";

  let buttonRow = document.createElement("div");
  buttonRow.className = "button-row";

  let title = document.createElement("h1");
  title.textContent = tv.name;
  title.className = "tv-title";

  let controls = document.createElement("div");
  controls.className = "controls";

  let dropdown = document.createElement("select");
  dropdown.appendChild(new Option("Choose", "Choose"));
  dropdown.appendChild(new Option("Currently Watching", "Currently Watching"));
  dropdown.appendChild(new Option("Add To Queue", "Add To Queue"));
  dropdown.appendChild(new Option("Already Watched", "Already Watched"));
  dropdown.className = "dropdown";

  let rateButton = document.createElement("button");
  rateButton.textContent = "Rate";
  rateButton.className = "rate-button";

  controls.appendChild(dropdown);
  controls.appendChild(rateButton);

  buttonRow.appendChild(controls);

  let detailsRow = document.createElement("div");
  detailsRow.className = "details-row";

  let img = document.createElement("img");
  img.className = "tv-poster";
  img.src = `https://image.tmdb.org/t/p/w500${tv.poster_path}`;
  img.alt = `${tv.name} poster`;

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

  let lineBreak = document.createElement("br");
  let emptyDiv = document.createElement("div");

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

  if (castData.results !== 0) {
    displayResults(castData.cast, "cast-details");
  }

  let reviewsSection = document.createElement("div");
  reviewsSection.className = "reviews-section";

  if (reviewsData && reviewsData.length !== 0) {
    let reviewsTitle = document.createElement("h2");
    reviewsTitle.textContent = "Reviews";
    reviewsSection.appendChild(reviewsTitle);

    reviewsData.forEach((review) => {
      let reviewContainer = document.createElement("div");
      reviewContainer.className = "review";

      let reviewer = document.createElement("p");
      reviewer.textContent = `Reviewer: ${review.author}`;
      reviewer.className = "reviewer";

      let rating = document.createElement("p");
      rating.textContent = `Rating: ${review.rating}`;
      rating.className = "review-rating";

      let content = document.createElement("p");
      content.textContent = review.comment;
      content.className = "review-content";

      reviewContainer.appendChild(reviewer);
      reviewContainer.appendChild(rating);
      reviewContainer.appendChild(content);

      reviewsSection.appendChild(reviewContainer);
    });
  }

  tvContainer.appendChild(title);
  tvContainer.appendChild(lineBreak);
  tvContainer.appendChild(buttonRow);
  tvContainer.appendChild(lineBreak);
  tvContainer.appendChild(detailsRow);
  tvContainer.appendChild(reviewsSection);
}
