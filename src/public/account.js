document.addEventListener("DOMContentLoaded", () => {
    fetchConfig().then(async (config) => {
        let loginResult = await checkLogin();
        //console.log(loginResult);
        if (loginResult.ok) {
            fetchUserInfo(config);
            //fetchFollowing(config);
            //fetchFollowers(config);
            //fetchLikedMovies(config);
        } else {
            // redirect user to login page
            //location.href = "./login.html";
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
    //console.log(data);
    displayUserInfo(data);

    async function displayUserInfo(data) {
        let welcomeName = document.getElementById("welcome-content");
        welcomeName.textContent = `Welcome ${data.username}`;

        let usernameData = document.getElementById("username-data");
        usernameData.textContent = data.username;

        let displayNameData = document.getElementById("display-name-data");
        displayNameData.textContent = "{placeholder}";
    }
}

async function fetchFollowing(config) {
    let result = await fetch("/get-following");
    let data = await result.json();
    displayFollowing(data);
   
    async function displayFollowing(data) {
        
    }
}

async function fetchFollowers(config) {

}

async function fetchLikedMovies(config) {

}