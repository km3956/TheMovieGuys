let createForm = document.getElementById("create-form");
createForm.addEventListener("submit", (event) => {
  // prevent page from refreshing
  event.preventDefault();

  let usernameInput = document.getElementById("username");
  let passwordInput = document.getElementById("password");

  fetch("/create", {
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
        case "Account creation successful":
          location.href = "./index.html";
          break;
        case "Username already taken":
          message.textContent = "Username already taken";
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
