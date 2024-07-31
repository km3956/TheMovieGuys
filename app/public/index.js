document.addEventListener("DOMContentLoaded", () => {
    fetch("/movie/now_playing")
        .then(response => response.json())
        .then(data => {
            const moviesContainer = document.createElement("div");
            data.results.forEach(movie => {
                const movieElement = document.createElement("p");
                movieElement.textContent = movie.title;
                moviesContainer.appendChild(movieElement);
            });
            document.body.appendChild(moviesContainer);
        })
        .catch(error => console.error("Error fetching now playing movies:", error));
});