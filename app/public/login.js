let loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", (event) => {
    // prevent page from refreshing
    event.preventDefault();

    let usernameInput = document.getElementById("username");
    let passwordInput = document.getElementById("password");

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username: usernameInput.value, password: passwordInput.value}),
    }).then(response => {
        // handle response
    }).catch(error => {
        console.log(error);
    });
});