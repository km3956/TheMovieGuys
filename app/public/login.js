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
        let message = document.getElementById("message");
        // handle response
        // 200 - account found
        // 400 - missing/incorrect username or password
        switch(response.status) {
            case 200:
                message.textContent = "Login successful";
                break;
            case 400:
                message.textContent = "Incorrect username or password"
        }
    }).catch(error => {
        console.log(error);
    });
});