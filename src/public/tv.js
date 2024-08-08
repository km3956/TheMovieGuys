document.addEventListener('DOMContentLoaded', () => {
    fetchConfig().then(config => {
        let urlParams = new URLSearchParams(window.location.search);
        let tvID = urlParams.get('id');
        if (tvID) {
            fetchTVDetails(config, tvID);
        } else {
            console.error('No TV ID found in URL');
        }
    });
});

async function fetchConfig() {
    try {
        let response = await fetch('env.json');
        let config = await response.json();
        return config;
    } catch (error) {
        console.error('Error loading configuration:', error);
    }
}

async function fetchTVDetails(config, tvID) {
    let { api_url, api_key } = config;
    let tvDetails = `${api_url}tv/${tvID}?api_key=${api_key}&language=en-US`;
    let tvProvider = `${api_url}tv/${tvID}/watch/providers?api_key=${api_key}`;

    try {
        let response = await fetch(tvDetails);
        let provider = await fetch(tvProvider);
        let data = await response.json();
        let providerData = await provider.json();
        createTVDetails(data, providerData);
    } catch (error) {
        console.error('Error fetching show details:', error);
    }
}


function createTVDetails(tv, providerData) {
    let tvContainer = document.getElementById('tv-details');
    tvContainer.textContent = '';

    let buttonRow = document.createElement('div');
    buttonRow.className = 'button-row';

    let title = document.createElement('h1');
    title.textContent = tv.title;
    title.className = 'tv-title';

    let controls = document.createElement('div');
    controls.className = 'controls';

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

    let detailsRow = document.createElement('div');
    detailsRow.className = 'details-row';

    let img = document.createElement('img');
    img.className = "tv-poster";
    img.src = `https://image.tmdb.org/t/p/w500${tv.poster_path}`;
    img.alt = `${tv.title} poster`;

    let info = document.createElement('div');
    info.className = 'tv-info';

    let firstAirDate = document.createElement('p');
    firstAirDate.textContent = `First Air Date: ${tv.first_air_date}`;

    let genres = document.createElement('p');
    genres.textContent = 'Genres: ' + tv.genres.map(genre => genre.name).join(', ');

    let overview = document.createElement('p');
    overview.textContent = `Overview: ${tv.overview}`;

    info.appendChild(firstAirDate);
    info.appendChild(genres);
    info.appendChild(overview);

    //Using US right now because that is the only country we are supporting
    let watchOptions = [];

    if (providerData.results && providerData.results.US) {

        if (providerData.results.US.flatrate && providerData.results.US.flatrate.length !== 0) {
            let flatrateOptions = providerData.results.US.flatrate.map(logo => ({
                path: logo.logo_path,
                name: logo.provider_name
            }));
            watchOptions = watchOptions.concat(flatrateOptions);
        }

        if (providerData.results.US.buy && providerData.results.US.buy.length !== 0) {
            let buyOptions = providerData.results.US.buy.map(logo => ({
                path: logo.logo_path,
                name: logo.provider_name
            }));
            watchOptions = watchOptions.concat(buyOptions);
        }
    }

    if (watchOptions.length !== 0) {
        let watch = document.createElement('p');
        watch.textContent = "Options to Watch: ";
        for (let i = 0; i < watchOptions.length; i++) {
            let img1 = document.createElement('img');
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
}


