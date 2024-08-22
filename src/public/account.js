document.addEventListener("DOMContentLoaded", () => {
    //$("#exampleModal").modal("hide");
    fetchConfig().then(async (config) => {
        let loginResult = await checkLogin();
        //console.log(loginResult);
        if (loginResult.ok) {
            fetchUserInfo(config);
            fetchFollowers(config);
            fetchFollowing(config);
            //fetchLikedMovies(config);
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
        let welcomeName = document.getElementById("welcome-content");
        welcomeName.textContent = `Welcome ${data.username}`;

        let usernameData = document.getElementById("username-data");
        usernameData.textContent = data.username;

        let displayNameData = document.getElementById("display-name-data");
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

}