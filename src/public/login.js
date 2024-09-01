let loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", (event) => {
  // prevent page from refreshing
  event.preventDefault();

  let usernameInput = document.getElementById("username");
  let passwordInput = document.getElementById("password");

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: usernameInput.value,
      password: passwordInput.value,
    }),
  })
    .then((response) => {
      return response.text();
    })
    .then((text) => {
      let message = document.getElementById("message");
      switch (text) {
        case "Login successful":
          location.assign("./index.html");
          break;
        case "Account not found":
        case "Incorrect password":
          message.textContent = "Incorrect username or password";
          usernameInput.value = "";
          passwordInput.value = "";
          break;
        case "Body structure error":
          message.textContent = "Enter a valid username and password";
          break;
        default:
          message.textContent = "Unexpected error, please try again";
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

let createButton = document.getElementById("create-account");
createButton.addEventListener("click", () => {
  location.assign("./create.html");
});
